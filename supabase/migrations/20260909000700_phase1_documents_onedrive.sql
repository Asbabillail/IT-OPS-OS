begin;

-- ============================================================
-- External document metadata
--
-- File bytes are NOT stored in PostgreSQL.
--
-- This table stores:
--   - local application document identity
--   - subject relationship
--   - OneDrive / Microsoft Graph metadata when available
--   - integration sync state
--
-- External integration failures must never delete or invalidate
-- the local document record.
-- ============================================================

create table if not exists public.document_records (
  id uuid primary key default gen_random_uuid(),

  document_code text not null,

  subject_type text not null,
  subject_id uuid not null,

  document_type text not null,
  file_name text not null,
  mime_type text,

  storage_provider text not null default 'OneDrive',

  drive_id text,
  drive_item_id text,
  web_url text,

  sync_status text not null default 'Pending',
  last_synced_at timestamptz,
  last_sync_error text,

  created_by_user_id uuid
    references public.app_users(id)
    on update restrict
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint document_records_code_not_blank
    check (btrim(document_code) <> ''),

  constraint document_records_code_format
    check (document_code like 'DOC-%'),

  constraint document_records_code_key
    unique (document_code),

  constraint document_records_subject_type_valid
    check (
      subject_type in (
        'Student',
        'Faculty',
        'Device',
        'Distribution',
        'BYOD',
        'Repair',
        'AppleCare',
        'Return',
        'Release'
      )
    ),

  constraint document_records_document_type_not_blank
    check (btrim(document_type) <> ''),

  constraint document_records_file_name_not_blank
    check (btrim(file_name) <> ''),

  constraint document_records_storage_provider_valid
    check (
      storage_provider = 'OneDrive'
    ),

  constraint document_records_sync_status_valid
    check (
      sync_status in (
        'Pending',
        'Synced',
        'Failed'
      )
    ),

  constraint document_records_drive_identity_consistent
    check (
      (
        drive_id is null
        and drive_item_id is null
        and web_url is null
      )
      or
      (
        drive_id is not null
        and drive_item_id is not null
      )
    ),

  constraint document_records_synced_state_consistent
    check (
      (
        sync_status = 'Synced'
        and drive_id is not null
        and drive_item_id is not null
        and last_synced_at is not null
        and last_sync_error is null
      )
      or
      (
        sync_status = 'Pending'
        and last_sync_error is null
      )
      or
      (
        sync_status = 'Failed'
        and last_sync_error is not null
      )
    )
);

create unique index if not exists
  document_records_onedrive_item_key
on public.document_records (drive_id, drive_item_id)
where drive_id is not null
  and drive_item_id is not null;

create index if not exists document_records_subject_idx
  on public.document_records (subject_type, subject_id);

create index if not exists document_records_document_type_idx
  on public.document_records (document_type);

create index if not exists document_records_sync_status_idx
  on public.document_records (sync_status);

create index if not exists document_records_created_at_idx
  on public.document_records (created_at desc);


-- ============================================================
-- Subject validation
--
-- subject_id is polymorphic and therefore cannot use one physical
-- foreign key. Validate subject existence according to subject_type.
-- ============================================================

create or replace function public.validate_document_subject()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  subject_exists boolean;
begin
  case new.subject_type
    when 'Student' then
      select exists (
        select 1
        from public.students
        where id = new.subject_id
      ) into subject_exists;

    when 'Faculty' then
      select exists (
        select 1
        from public.faculty
        where id = new.subject_id
      ) into subject_exists;

    when 'Device' then
      select exists (
        select 1
        from public.devices
        where id = new.subject_id
      ) into subject_exists;

    when 'Distribution' then
      select exists (
        select 1
        from public.distributions
        where id = new.subject_id
      ) into subject_exists;

    when 'BYOD' then
      select exists (
        select 1
        from public.byod_records
        where id = new.subject_id
      ) into subject_exists;

    when 'Repair' then
      select exists (
        select 1
        from public.repairs
        where id = new.subject_id
      ) into subject_exists;

    when 'AppleCare' then
      select exists (
        select 1
        from public.applecare_claims
        where id = new.subject_id
      ) into subject_exists;

    when 'Return' then
      select exists (
        select 1
        from public.returns
        where id = new.subject_id
      ) into subject_exists;

    when 'Release' then
      select exists (
        select 1
        from public.releases
        where id = new.subject_id
      ) into subject_exists;

    else
      subject_exists := false;
  end case;

  if not subject_exists then
    raise exception
      'Document subject % % does not exist',
      new.subject_type,
      new.subject_id
      using errcode = '23503';
  end if;

  return new;
end;
$$;

drop trigger if exists document_records_validate_subject
  on public.document_records;

create trigger document_records_validate_subject
before insert or update on public.document_records
for each row
execute function public.validate_document_subject();


-- ============================================================
-- History-preserving identity
--
-- Document identity, subject relationship and original filename
-- cannot be rewritten after creation.
--
-- Sync state and external Graph metadata may evolve because
-- OneDrive is an external integration.
-- ============================================================

create or replace function public.guard_document_identity_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id is distinct from new.id
     or old.document_code is distinct from new.document_code
     or old.subject_type is distinct from new.subject_type
     or old.subject_id is distinct from new.subject_id
     or old.document_type is distinct from new.document_type
     or old.file_name is distinct from new.file_name
     or old.storage_provider is distinct from new.storage_provider
     or old.created_by_user_id is distinct from new.created_by_user_id
     or old.created_at is distinct from new.created_at
  then
    raise exception
      'Document identity/history fields cannot be modified'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists document_records_history_guard
  on public.document_records;

create trigger document_records_history_guard
before update on public.document_records
for each row
execute function public.guard_document_identity_history();


drop trigger if exists document_records_set_updated_at
  on public.document_records;

create trigger document_records_set_updated_at
before update on public.document_records
for each row
execute function public.set_updated_at();


-- ============================================================
-- Delete protection
-- ============================================================

create or replace function public.prevent_document_record_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Document records are history-preserving; DELETE is not permitted'
    using errcode = '55000';
end;
$$;

drop trigger if exists document_records_prevent_delete
  on public.document_records;

create trigger document_records_prevent_delete
before delete on public.document_records
for each row
execute function public.prevent_document_record_delete();


-- ============================================================
-- Row Level Security
--
-- Authentication remains deferred during pilot schema work.
-- ============================================================

alter table public.document_records enable row level security;
alter table public.document_records force row level security;

drop policy if exists document_records_fail_closed
  on public.document_records;

create policy document_records_fail_closed
on public.document_records
for all
to public
using (false)
with check (false);

commit;
