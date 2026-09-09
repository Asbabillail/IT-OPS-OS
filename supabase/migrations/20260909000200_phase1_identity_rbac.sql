begin;

-- ============================================================
-- Application users
--
-- Identity-provider neutral application record.
-- Entra tenant/object IDs are stable external identifiers.
-- No tokens, client secrets, passwords, or credentials belong here.
-- ============================================================

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),

  entra_tenant_id uuid not null,
  entra_object_id uuid not null,

  email text not null,
  display_name text not null,

  status text not null default 'Active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint app_users_email_not_blank
    check (btrim(email) <> ''),

  constraint app_users_display_name_not_blank
    check (btrim(display_name) <> ''),

  constraint app_users_status_valid
    check (status in ('Active', 'Inactive')),

  constraint app_users_entra_identity_key
    unique (entra_tenant_id, entra_object_id)
);

create unique index if not exists app_users_email_ci_key
  on public.app_users (lower(email));

create index if not exists app_users_status_idx
  on public.app_users (status);

drop trigger if exists app_users_set_updated_at
  on public.app_users;

create trigger app_users_set_updated_at
before update on public.app_users
for each row
execute function public.set_updated_at();


-- ============================================================
-- Application roles
--
-- Fixed Phase 1 role vocabulary.
-- Role codes are stable authorization identifiers.
-- ============================================================

create table if not exists public.app_roles (
  id uuid primary key default gen_random_uuid(),

  code text not null,
  name text not null,
  description text not null,

  created_at timestamptz not null default now(),

  constraint app_roles_code_not_blank
    check (btrim(code) <> ''),

  constraint app_roles_name_not_blank
    check (btrim(name) <> ''),

  constraint app_roles_description_not_blank
    check (btrim(description) <> ''),

  constraint app_roles_code_key
    unique (code),

  constraint app_roles_code_valid
    check (
      code in (
        'HEAD_OF_IT',
        'IT_ADMIN',
        'IT_TECHNICIAN',
        'ADMISSIONS',
        'HR',
        'READ_ONLY'
      )
    )
);


-- ============================================================
-- Seed canonical Phase 1 roles
--
-- Idempotent by stable role code.
-- ============================================================

insert into public.app_roles (
  code,
  name,
  description
)
values
  (
    'HEAD_OF_IT',
    'Head of IT',
    'Full operational authority and sole authority to grant or revoke application roles.'
  ),
  (
    'IT_ADMIN',
    'IT Administrator',
    'Full IT operational access without application role administration authority.'
  ),
  (
    'IT_TECHNICIAN',
    'IT Technician',
    'Operational IT workflow access without role administration or executive override authority.'
  ),
  (
    'ADMISSIONS',
    'Admissions',
    'Student intake and permitted student record access without IT workflow approval authority.'
  ),
  (
    'HR',
    'Human Resources',
    'Faculty intake and permitted faculty record access without IT workflow approval authority.'
  ),
  (
    'READ_ONLY',
    'Read Only',
    'Read-only access to records explicitly permitted by authorization policy.'
  )
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description;


-- ============================================================
-- User role assignments
--
-- History preserving:
-- - granting creates a row
-- - revocation sets revoked_at
-- - rows are never deleted
-- - identity/role/grant metadata cannot be rewritten
-- ============================================================

create table if not exists public.user_role_assignments (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.app_users(id)
    on update restrict
    on delete restrict,

  role_id uuid not null
    references public.app_roles(id)
    on update restrict
    on delete restrict,

  granted_by_user_id uuid
    references public.app_users(id)
    on update restrict
    on delete restrict,

  granted_at timestamptz not null default now(),
  revoked_at timestamptz,

  created_at timestamptz not null default now(),

  constraint user_role_assignments_revocation_valid
    check (
      revoked_at is null
      or revoked_at >= granted_at
    )
);

create unique index if not exists
  user_role_assignments_one_active_role_idx
on public.user_role_assignments (user_id, role_id)
where revoked_at is null;

create index if not exists user_role_assignments_user_history_idx
  on public.user_role_assignments (user_id, granted_at desc);

create index if not exists user_role_assignments_role_idx
  on public.user_role_assignments (role_id)
  where revoked_at is null;


-- ============================================================
-- Role-assignment mutation guard
--
-- Existing assignment identity/history cannot be rewritten.
-- The only permitted UPDATE is:
--
--   revoked_at: NULL -> non-NULL
--
-- DELETE is prohibited.
-- ============================================================

create or replace function public.guard_user_role_assignment_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception
      'user_role_assignments is history-preserving; DELETE is not permitted'
      using errcode = '55000';
  end if;

  if old.id is distinct from new.id
     or old.user_id is distinct from new.user_id
     or old.role_id is distinct from new.role_id
     or old.granted_by_user_id is distinct from new.granted_by_user_id
     or old.granted_at is distinct from new.granted_at
     or old.created_at is distinct from new.created_at
  then
    raise exception
      'Historical role-assignment fields cannot be modified'
      using errcode = '55000';
  end if;

  if old.revoked_at is not null then
    raise exception
      'A revoked role assignment cannot be modified'
      using errcode = '55000';
  end if;

  if new.revoked_at is null then
    raise exception
      'The only permitted role-assignment update is revocation'
      using errcode = '55000';
  end if;

  if new.revoked_at < old.granted_at then
    raise exception
      'revoked_at cannot precede granted_at'
      using errcode = '22007';
  end if;

  return new;
end;
$$;

drop trigger if exists user_role_assignments_history_guard
  on public.user_role_assignments;

create trigger user_role_assignments_history_guard
before update or delete on public.user_role_assignments
for each row
execute function public.guard_user_role_assignment_history();


-- ============================================================
-- Actor foreign keys for existing history tables
--
-- actor_user_id was deliberately created without an FK in the
-- first migration because the canonical user table did not yet
-- exist.
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'timeline_events_actor_user_id_fkey'
      and conrelid = 'public.timeline_events'::regclass
  ) then
    alter table public.timeline_events
      add constraint timeline_events_actor_user_id_fkey
      foreign key (actor_user_id)
      references public.app_users(id)
      on update restrict
      on delete restrict;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'audit_events_actor_user_id_fkey'
      and conrelid = 'public.audit_events'::regclass
  ) then
    alter table public.audit_events
      add constraint audit_events_actor_user_id_fkey
      foreign key (actor_user_id)
      references public.app_users(id)
      on update restrict
      on delete restrict;
  end if;
end;
$$;


-- ============================================================
-- Row Level Security
--
-- Still fail-closed.
--
-- We are intentionally NOT opening policies until the authenticated
-- request identity -> app_users mapping is implemented and tested.
-- ============================================================

alter table public.app_users enable row level security;
alter table public.app_users force row level security;

alter table public.app_roles enable row level security;
alter table public.app_roles force row level security;

alter table public.user_role_assignments enable row level security;
alter table public.user_role_assignments force row level security;

drop policy if exists app_users_fail_closed
  on public.app_users;

create policy app_users_fail_closed
on public.app_users
for all
to public
using (false)
with check (false);

drop policy if exists app_roles_fail_closed
  on public.app_roles;

create policy app_roles_fail_closed
on public.app_roles
for all
to public
using (false)
with check (false);

drop policy if exists user_role_assignments_fail_closed
  on public.user_role_assignments;

create policy user_role_assignments_fail_closed
on public.user_role_assignments
for all
to public
using (false)
with check (false);

commit;
