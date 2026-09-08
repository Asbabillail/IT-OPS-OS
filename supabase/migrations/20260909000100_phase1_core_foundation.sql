begin;

create extension if not exists pgcrypto;

-- ============================================================
-- Shared trigger functions
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_append_only_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Table %.% is append-only; % is not permitted',
    tg_table_schema,
    tg_table_name,
    tg_op
    using errcode = '55000';
end;
$$;

-- ============================================================
-- Students
-- ============================================================

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),

  student_code text not null,
  name text not null,
  grade text not null,
  email text not null,
  enrollment_status text not null,

  guardian_name text not null,
  guardian_phone text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint students_student_code_not_blank
    check (btrim(student_code) <> ''),

  constraint students_student_code_format
    check (student_code like 'STU-%'),

  constraint students_name_not_blank
    check (btrim(name) <> ''),

  constraint students_email_not_blank
    check (btrim(email) <> ''),

  constraint students_enrollment_status_valid
    check (enrollment_status in ('Active', 'Inactive')),

  constraint students_student_code_key
    unique (student_code)
);

create index if not exists students_name_idx
  on public.students (name);

create index if not exists students_email_idx
  on public.students (email);

drop trigger if exists students_set_updated_at
  on public.students;

create trigger students_set_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

-- ============================================================
-- Faculty
-- ============================================================

create table if not exists public.faculty (
  id uuid primary key default gen_random_uuid(),

  faculty_code text not null,
  name text not null,
  department text not null,
  email text not null,
  employment_status text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint faculty_faculty_code_not_blank
    check (btrim(faculty_code) <> ''),

  constraint faculty_faculty_code_format
    check (faculty_code like 'FAC-%'),

  constraint faculty_name_not_blank
    check (btrim(name) <> ''),

  constraint faculty_email_not_blank
    check (btrim(email) <> ''),

  constraint faculty_employment_status_valid
    check (employment_status in ('Active', 'Inactive')),

  constraint faculty_faculty_code_key
    unique (faculty_code)
);

create index if not exists faculty_name_idx
  on public.faculty (name);

create index if not exists faculty_email_idx
  on public.faculty (email);

drop trigger if exists faculty_set_updated_at
  on public.faculty;

create trigger faculty_set_updated_at
before update on public.faculty
for each row
execute function public.set_updated_at();

-- ============================================================
-- Devices
-- ============================================================

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),

  serial text not null,
  asset_tag text not null,
  model text not null,
  storage text not null,
  status text not null,

  purchase_date date not null,
  warranty_status text not null,
  applecare_status text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint devices_serial_not_blank
    check (btrim(serial) <> ''),

  constraint devices_asset_tag_not_blank
    check (btrim(asset_tag) <> ''),

  constraint devices_model_not_blank
    check (btrim(model) <> ''),

  constraint devices_status_valid
    check (
      status in (
        'Assigned',
        'Available',
        'In Repair',
        'Awaiting Parts'
      )
    ),

  constraint devices_warranty_status_valid
    check (warranty_status in ('Active', 'Expired')),

  constraint devices_applecare_status_valid
    check (applecare_status in ('Active', 'Expired', 'None')),

  constraint devices_serial_key
    unique (serial),

  constraint devices_asset_tag_key
    unique (asset_tag)
);

create index if not exists devices_status_idx
  on public.devices (status);

create index if not exists devices_model_idx
  on public.devices (model);

drop trigger if exists devices_set_updated_at
  on public.devices;

create trigger devices_set_updated_at
before update on public.devices
for each row
execute function public.set_updated_at();

-- ============================================================
-- Device assignments
--
-- Current assignment is determined by:
--   status = 'Active'
--   returned_at is null
--
-- Historical rows remain after return/reassignment.
-- ============================================================

create table if not exists public.device_assignments (
  id uuid primary key default gen_random_uuid(),

  device_id uuid not null
    references public.devices(id)
    on update restrict
    on delete restrict,

  assignee_type text not null,

  student_id uuid
    references public.students(id)
    on update restrict
    on delete restrict,

  faculty_id uuid
    references public.faculty(id)
    on update restrict
    on delete restrict,

  assigned_at timestamptz not null,
  returned_at timestamptz,

  status text not null,
  verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint device_assignments_assignee_type_valid
    check (assignee_type in ('Student', 'Faculty')),

  constraint device_assignments_status_valid
    check (status in ('Active', 'Closed')),

  constraint device_assignments_exactly_one_assignee
    check (
      (
        assignee_type = 'Student'
        and student_id is not null
        and faculty_id is null
      )
      or
      (
        assignee_type = 'Faculty'
        and faculty_id is not null
        and student_id is null
      )
    ),

  constraint device_assignments_return_state_valid
    check (
      (
        status = 'Active'
        and returned_at is null
      )
      or
      (
        status = 'Closed'
        and returned_at is not null
      )
    ),

  constraint device_assignments_return_after_assignment
    check (
      returned_at is null
      or returned_at >= assigned_at
    ),

  constraint device_assignments_verification_after_assignment
    check (
      verified_at is null
      or verified_at >= assigned_at
    )
);

create unique index if not exists
  device_assignments_one_active_assignment_per_device_idx
on public.device_assignments (device_id)
where status = 'Active' and returned_at is null;

create index if not exists device_assignments_student_idx
  on public.device_assignments (student_id)
  where student_id is not null;

create index if not exists device_assignments_faculty_idx
  on public.device_assignments (faculty_id)
  where faculty_id is not null;

create index if not exists device_assignments_device_history_idx
  on public.device_assignments (device_id, assigned_at desc);

drop trigger if exists device_assignments_set_updated_at
  on public.device_assignments;

create trigger device_assignments_set_updated_at
before update on public.device_assignments
for each row
execute function public.set_updated_at();

-- ============================================================
-- Timeline events
--
-- Intentionally polymorphic.
-- entity_id is the UUID of the referenced domain record.
-- Immutable after insertion.
-- ============================================================

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),

  entity_type text not null,
  entity_id uuid not null,

  event_type text not null,
  title text not null,
  description text not null,

  occurred_at timestamptz not null default now(),

  actor_user_id uuid,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint timeline_events_entity_type_not_blank
    check (btrim(entity_type) <> ''),

  constraint timeline_events_event_type_not_blank
    check (btrim(event_type) <> ''),

  constraint timeline_events_title_not_blank
    check (btrim(title) <> ''),

  constraint timeline_events_metadata_object
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists timeline_events_entity_idx
  on public.timeline_events (
    entity_type,
    entity_id,
    occurred_at desc
  );

create index if not exists timeline_events_occurred_at_idx
  on public.timeline_events (occurred_at desc);

drop trigger if exists timeline_events_append_only
  on public.timeline_events;

create trigger timeline_events_append_only
before update or delete on public.timeline_events
for each row
execute function public.prevent_append_only_mutation();

-- ============================================================
-- Audit events
--
-- Append-only system governance ledger.
-- actor_user_id remains nullable until the authentication/RBAC
-- foundation migration introduces the canonical application-user
-- relationship.
-- ============================================================

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),

  actor_user_id uuid,

  action text not null,
  entity_type text not null,
  entity_id uuid not null,

  before_state jsonb,
  after_state jsonb,

  request_id uuid,

  created_at timestamptz not null default now(),

  constraint audit_events_action_not_blank
    check (btrim(action) <> ''),

  constraint audit_events_entity_type_not_blank
    check (btrim(entity_type) <> ''),

  constraint audit_events_before_state_object
    check (
      before_state is null
      or jsonb_typeof(before_state) = 'object'
    ),

  constraint audit_events_after_state_object
    check (
      after_state is null
      or jsonb_typeof(after_state) = 'object'
    )
);

create index if not exists audit_events_entity_idx
  on public.audit_events (
    entity_type,
    entity_id,
    created_at desc
  );

create index if not exists audit_events_actor_idx
  on public.audit_events (
    actor_user_id,
    created_at desc
  )
  where actor_user_id is not null;

create index if not exists audit_events_request_idx
  on public.audit_events (request_id)
  where request_id is not null;

drop trigger if exists audit_events_append_only
  on public.audit_events;

create trigger audit_events_append_only
before update or delete on public.audit_events
for each row
execute function public.prevent_append_only_mutation();

-- ============================================================
-- Row Level Security
--
-- Phase 1 foundation is intentionally fail-closed.
-- Authorization policies will be opened deliberately only after
-- Entra/application-role mapping is implemented.
-- ============================================================

alter table public.students enable row level security;
alter table public.students force row level security;

alter table public.faculty enable row level security;
alter table public.faculty force row level security;

alter table public.devices enable row level security;
alter table public.devices force row level security;

alter table public.device_assignments enable row level security;
alter table public.device_assignments force row level security;

alter table public.timeline_events enable row level security;
alter table public.timeline_events force row level security;

alter table public.audit_events enable row level security;
alter table public.audit_events force row level security;

drop policy if exists students_fail_closed
  on public.students;

create policy students_fail_closed
on public.students
for all
to public
using (false)
with check (false);

drop policy if exists faculty_fail_closed
  on public.faculty;

create policy faculty_fail_closed
on public.faculty
for all
to public
using (false)
with check (false);

drop policy if exists devices_fail_closed
  on public.devices;

create policy devices_fail_closed
on public.devices
for all
to public
using (false)
with check (false);

drop policy if exists device_assignments_fail_closed
  on public.device_assignments;

create policy device_assignments_fail_closed
on public.device_assignments
for all
to public
using (false)
with check (false);

drop policy if exists timeline_events_fail_closed
  on public.timeline_events;

create policy timeline_events_fail_closed
on public.timeline_events
for all
to public
using (false)
with check (false);

drop policy if exists audit_events_fail_closed
  on public.audit_events;

create policy audit_events_fail_closed
on public.audit_events
for all
to public
using (false)
with check (false);

commit;
