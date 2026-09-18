begin;

-- ============================================================
-- BYOD workflow
--
-- BYOD devices are privately owned and therefore are NOT rows
-- in public.devices, which remains authoritative for school-owned
-- inventory.
--
-- TypeScript ByodRecord mapping:
--
--   id               -> byod_code
--   owner.type       -> owner_type
--   owner.id         -> student_id / faculty_id
--   deviceModel      -> device_model
--   serial           -> serial
--   ownership        -> ownership
--   enrollmentStatus -> enrollment_status
--   complianceStatus -> compliance_status
--   registeredDate   -> registered_date
--   enrolledDate     -> enrolled_date
--   reviewedDate     -> reviewed_date
-- ============================================================

create table if not exists public.byod_records (
  id uuid primary key default gen_random_uuid(),

  byod_code text not null,

  owner_type text not null,

  student_id uuid
    references public.students(id)
    on update restrict
    on delete restrict,

  faculty_id uuid
    references public.faculty(id)
    on update restrict
    on delete restrict,

  device_model text not null,
  serial text not null,

  ownership text not null,
  enrollment_status text not null,
  compliance_status text not null,

  registered_date date not null,
  enrolled_date date,
  reviewed_date date,

  reviewed_by_user_id uuid
    references public.app_users(id)
    on update restrict
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint byod_records_code_not_blank
    check (btrim(byod_code) <> ''),

  constraint byod_records_code_format
    check (byod_code like 'BYOD-%'),

  constraint byod_records_code_key
    unique (byod_code),

  constraint byod_records_serial_not_blank
    check (btrim(serial) <> ''),

  constraint byod_records_serial_key
    unique (serial),

  constraint byod_records_device_model_not_blank
    check (btrim(device_model) <> ''),

  constraint byod_records_owner_type_valid
    check (
      owner_type in (
        'Student',
        'Faculty'
      )
    ),

  constraint byod_records_ownership_valid
    check (
      ownership in (
        'Student Owned',
        'Faculty Owned'
      )
    ),

  constraint byod_records_exactly_one_owner
    check (
      (
        owner_type = 'Student'
        and ownership = 'Student Owned'
        and student_id is not null
        and faculty_id is null
      )
      or
      (
        owner_type = 'Faculty'
        and ownership = 'Faculty Owned'
        and faculty_id is not null
        and student_id is null
      )
    ),

  constraint byod_records_enrollment_status_valid
    check (
      enrollment_status in (
        'Pending',
        'Enrolled'
      )
    ),

  constraint byod_records_compliance_status_valid
    check (
      compliance_status in (
        'Review Required',
        'Compliant'
      )
    ),

  constraint byod_records_enrollment_state_consistent
    check (
      (
        enrollment_status = 'Pending'
        and enrolled_date is null
      )
      or
      (
        enrollment_status = 'Enrolled'
        and enrolled_date is not null
      )
    ),

  constraint byod_records_enrollment_chronology
    check (
      enrolled_date is null
      or enrolled_date >= registered_date
    ),

  constraint byod_records_review_chronology
    check (
      reviewed_date is null
      or reviewed_date >= registered_date
    ),

  constraint byod_records_compliance_review_required
    check (
      compliance_status <> 'Compliant'
      or reviewed_date is not null
    ),

  constraint byod_records_reviewer_requires_review_date
    check (
      reviewed_by_user_id is null
      or reviewed_date is not null
    )
);

create index if not exists byod_records_student_idx
  on public.byod_records (student_id)
  where student_id is not null;

create index if not exists byod_records_faculty_idx
  on public.byod_records (faculty_id)
  where faculty_id is not null;

create index if not exists byod_records_enrollment_status_idx
  on public.byod_records (enrollment_status);

create index if not exists byod_records_compliance_status_idx
  on public.byod_records (compliance_status);

create index if not exists byod_records_registered_date_idx
  on public.byod_records (registered_date desc);


-- ============================================================
-- History preservation
--
-- BYOD identity, physical-device identity, and ownership cannot
-- be reassigned by rewriting an existing row.
--
-- Operational enrollment/compliance state may evolve over time.
-- Those changes will later also emit timeline/audit events through
-- the application service layer.
-- ============================================================

create or replace function public.guard_byod_identity_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id is distinct from new.id
     or old.byod_code is distinct from new.byod_code
     or old.owner_type is distinct from new.owner_type
     or old.student_id is distinct from new.student_id
     or old.faculty_id is distinct from new.faculty_id
     or old.device_model is distinct from new.device_model
     or old.serial is distinct from new.serial
     or old.ownership is distinct from new.ownership
     or old.registered_date is distinct from new.registered_date
     or old.created_at is distinct from new.created_at
  then
    raise exception
      'BYOD identity/history fields cannot be modified'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists byod_records_history_guard
  on public.byod_records;

create trigger byod_records_history_guard
before update on public.byod_records
for each row
execute function public.guard_byod_identity_history();


drop trigger if exists byod_records_set_updated_at
  on public.byod_records;

create trigger byod_records_set_updated_at
before update on public.byod_records
for each row
execute function public.set_updated_at();


-- ============================================================
-- Delete protection
-- ============================================================

create or replace function public.prevent_byod_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'BYOD records are history-preserving; DELETE is not permitted'
    using errcode = '55000';
end;
$$;

drop trigger if exists byod_records_prevent_delete
  on public.byod_records;

create trigger byod_records_prevent_delete
before delete on public.byod_records
for each row
execute function public.prevent_byod_delete();


-- ============================================================
-- Row Level Security
--
-- Pilot authentication is still deferred.
-- Keep BYOD access fail-closed.
-- ============================================================

alter table public.byod_records enable row level security;
alter table public.byod_records force row level security;

drop policy if exists byod_records_fail_closed
  on public.byod_records;

create policy byod_records_fail_closed
on public.byod_records
for all
to public
using (false)
with check (false);

commit;
