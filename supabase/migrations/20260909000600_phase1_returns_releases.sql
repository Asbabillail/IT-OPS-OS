begin;

-- ============================================================
-- Return workflow
--
-- The authoritative student/device relationship remains in
-- device_assignments.
--
-- TypeScript ReturnRecord mapping:
--
--   id                   -> return_code
--   studentId            -> assignment_id -> student_id
--   deviceSerial         -> assignment_id -> device_id -> serial
--   returnStatus         -> return_status
--   condition            -> condition
--   accessories          -> accessories
--   outcome              -> outcome
--   initiatedDate        -> initiated_date
--   receivedDate         -> received_date
--   inspectedDate        -> inspected_date
--   assignmentClosedDate -> assignment_id -> returned_at
--   inspectionNotes      -> inspection_notes
--   repairId             -> repair_id
--
-- assignment_closed_date is deliberately NOT duplicated here.
-- ============================================================

create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),

  return_code text not null,

  assignment_id uuid not null
    references public.device_assignments(id)
    on update restrict
    on delete restrict,

  return_status text not null,
  condition text not null,
  accessories text not null,
  outcome text not null,

  initiated_date date not null,
  received_date date not null,
  inspected_date date,

  inspection_notes text not null,

  repair_id uuid
    references public.repairs(id)
    on update restrict
    on delete restrict,

  inspected_by_user_id uuid
    references public.app_users(id)
    on update restrict
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint returns_code_not_blank
    check (btrim(return_code) <> ''),

  constraint returns_code_format
    check (return_code like 'RET-%'),

  constraint returns_code_key
    unique (return_code),

  constraint returns_assignment_key
    unique (assignment_id),

  constraint returns_status_valid
    check (
      return_status in (
        'Received',
        'Inspection Required'
      )
    ),

  constraint returns_condition_valid
    check (
      condition in (
        'Good',
        'Screen Damage'
      )
    ),

  constraint returns_accessories_valid
    check (
      accessories in (
        'Complete',
        'Missing Charger'
      )
    ),

  constraint returns_outcome_valid
    check (
      outcome in (
        'Ready for Release',
        'Repair Required'
      )
    ),

  constraint returns_inspection_notes_not_blank
    check (btrim(inspection_notes) <> ''),

  constraint returns_received_chronology
    check (
      received_date >= initiated_date
    ),

  constraint returns_inspected_chronology
    check (
      inspected_date is null
      or inspected_date >= received_date
    ),

  constraint returns_inspector_requires_inspection_date
    check (
      inspected_by_user_id is null
      or inspected_date is not null
    ),

  constraint returns_outcome_state_consistent
    check (
      (
        outcome = 'Ready for Release'
        and repair_id is null
        and inspected_date is not null
      )
      or
      (
        outcome = 'Repair Required'
        and repair_id is not null
      )
    )
);

create index if not exists returns_status_idx
  on public.returns (return_status);

create index if not exists returns_outcome_idx
  on public.returns (outcome);

create index if not exists returns_received_date_idx
  on public.returns (received_date desc);

create index if not exists returns_repair_idx
  on public.returns (repair_id)
  where repair_id is not null;


-- ============================================================
-- Return relationship validation
--
-- Returns are currently student-device workflows.
--
-- If the return references a repair, that repair must belong to
-- the same physical device as the referenced assignment.
-- ============================================================

create or replace function public.validate_return_relationships()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  assignment_record public.device_assignments%rowtype;
  repair_device_id uuid;
begin
  select *
  into assignment_record
  from public.device_assignments
  where id = new.assignment_id;

  if not found then
    raise exception
      'Return assignment % does not exist',
      new.assignment_id
      using errcode = '23503';
  end if;

  if assignment_record.assignee_type <> 'Student'
     or assignment_record.student_id is null
     or assignment_record.faculty_id is not null
  then
    raise exception
      'Return % must reference a Student device assignment',
      new.return_code
      using errcode = '23514';
  end if;

  if new.initiated_date < assignment_record.assigned_at::date then
    raise exception
      'Return initiation date cannot precede assignment date'
      using errcode = '23514';
  end if;

  if new.repair_id is not null then
    select device_id
    into repair_device_id
    from public.repairs
    where id = new.repair_id;

    if not found then
      raise exception
        'Return repair % does not exist',
        new.repair_id
        using errcode = '23503';
    end if;

    if repair_device_id <> assignment_record.device_id then
      raise exception
        'Return repair must reference the same device as the assignment'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists returns_validate_relationships
  on public.returns;

create trigger returns_validate_relationships
before insert or update on public.returns
for each row
execute function public.validate_return_relationships();


-- ============================================================
-- Return history protection
--
-- Return identity and original assignment cannot be rewritten.
-- Workflow fields remain mutable while the return progresses.
-- ============================================================

create or replace function public.guard_return_identity_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id is distinct from new.id
     or old.return_code is distinct from new.return_code
     or old.assignment_id is distinct from new.assignment_id
     or old.initiated_date is distinct from new.initiated_date
     or old.received_date is distinct from new.received_date
     or old.created_at is distinct from new.created_at
  then
    raise exception
      'Return identity/history fields cannot be modified'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists returns_history_guard
  on public.returns;

create trigger returns_history_guard
before update on public.returns
for each row
execute function public.guard_return_identity_history();


drop trigger if exists returns_set_updated_at
  on public.returns;

create trigger returns_set_updated_at
before update on public.returns
for each row
execute function public.set_updated_at();


-- ============================================================
-- Return delete protection
-- ============================================================

create or replace function public.prevent_return_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Return records are history-preserving; DELETE is not permitted'
    using errcode = '55000';
end;
$$;

drop trigger if exists returns_prevent_delete
  on public.returns;

create trigger returns_prevent_delete
before delete on public.returns
for each row
execute function public.prevent_return_delete();


-- ============================================================
-- Release workflow
--
-- Release has exactly one source:
--
--   Return -> device derived through return.assignment_id
--   Repair -> device derived through repair.device_id
--
-- TypeScript ReleaseRecord mapping:
--
--   id                   -> release_code
--   deviceSerial         -> derived from source
--   source.type          -> source_type
--   source.id            -> return_id / repair_id
--   eligibility          -> eligibility
--   action               -> action
--   status               -> status
--   validation           -> validation
--   releaseDate          -> release_date
--   resultingDeviceState -> resulting_device_state
-- ============================================================

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),

  release_code text not null,

  source_type text not null,

  return_id uuid
    references public.returns(id)
    on update restrict
    on delete restrict,

  repair_id uuid
    references public.repairs(id)
    on update restrict
    on delete restrict,

  eligibility text not null,
  action text not null,
  status text not null,
  validation text not null,

  release_date date,
  resulting_device_state text,

  released_by_user_id uuid
    references public.app_users(id)
    on update restrict
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint releases_code_not_blank
    check (btrim(release_code) <> ''),

  constraint releases_code_format
    check (release_code like 'REL-%'),

  constraint releases_code_key
    unique (release_code),

  constraint releases_source_type_valid
    check (
      source_type in (
        'Return',
        'Repair'
      )
    ),

  constraint releases_exactly_one_source
    check (
      (
        source_type = 'Return'
        and return_id is not null
        and repair_id is null
      )
      or
      (
        source_type = 'Repair'
        and repair_id is not null
        and return_id is null
      )
    ),

  constraint releases_eligibility_valid
    check (
      eligibility in (
        'Eligible',
        'Blocked'
      )
    ),

  constraint releases_action_valid
    check (
      action in (
        'Release to Available',
        'None'
      )
    ),

  constraint releases_status_valid
    check (
      status in (
        'Ready',
        'Awaiting Repair Completion'
      )
    ),

  constraint releases_validation_valid
    check (
      validation in (
        'Return workflow complete',
        'Repair workflow incomplete'
      )
    ),

  constraint releases_resulting_device_state_valid
    check (
      resulting_device_state is null
      or resulting_device_state in (
        'Assigned',
        'Available',
        'In Repair',
        'Awaiting Parts'
      )
    ),

  constraint releases_phase1_state_consistent
    check (
      (
        source_type = 'Return'
        and eligibility = 'Eligible'
        and action = 'Release to Available'
        and status = 'Ready'
        and validation = 'Return workflow complete'
      )
      or
      (
        source_type = 'Repair'
        and eligibility = 'Blocked'
        and action = 'None'
        and status = 'Awaiting Repair Completion'
        and validation = 'Repair workflow incomplete'
        and release_date is null
        and resulting_device_state is null
        and released_by_user_id is null
      )
    ),

  constraint releases_execution_state_consistent
    check (
      (
        release_date is null
        and resulting_device_state is null
        and released_by_user_id is null
      )
      or
      (
        release_date is not null
        and source_type = 'Return'
        and eligibility = 'Eligible'
        and action = 'Release to Available'
        and status = 'Ready'
        and validation = 'Return workflow complete'
        and resulting_device_state = 'Available'
      )
    )
);

create unique index if not exists releases_return_source_key
  on public.releases (return_id)
  where return_id is not null;

create unique index if not exists releases_repair_source_key
  on public.releases (repair_id)
  where repair_id is not null;

create index if not exists releases_eligibility_idx
  on public.releases (eligibility);

create index if not exists releases_status_idx
  on public.releases (status);

create index if not exists releases_release_date_idx
  on public.releases (release_date desc)
  where release_date is not null;


-- ============================================================
-- Release source validation
--
-- A Return source is considered ready only when:
--
--   - return outcome is Ready for Release
--   - inspection is complete
--   - referenced assignment is Closed
--
-- The assignment's returned_at remains the authoritative
-- assignmentClosedDate.
--
-- Repair-source releases are currently blocked workflows because
-- the Phase 1 TypeScript contract does not yet define a
-- "Repair workflow complete" release validation state.
-- ============================================================

create or replace function public.validate_release_source()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  return_record public.returns%rowtype;
  assignment_record public.device_assignments%rowtype;
begin
  if new.source_type = 'Return' then
    select *
    into return_record
    from public.returns
    where id = new.return_id;

    if not found then
      raise exception
        'Release return source % does not exist',
        new.return_id
        using errcode = '23503';
    end if;

    select *
    into assignment_record
    from public.device_assignments
    where id = return_record.assignment_id;

    if not found then
      raise exception
        'Return assignment % does not exist',
        return_record.assignment_id
        using errcode = '23503';
    end if;

    if return_record.outcome <> 'Ready for Release'
       or return_record.inspected_date is null
    then
      raise exception
        'Return source is not complete enough for release'
        using errcode = '23514';
    end if;

    if assignment_record.status <> 'Closed'
       or assignment_record.returned_at is null
    then
      raise exception
        'Device assignment must be closed before release'
        using errcode = '23514';
    end if;

    if new.release_date is not null
       and new.release_date < assignment_record.returned_at::date
    then
      raise exception
        'Release date cannot precede assignment closure'
        using errcode = '23514';
    end if;
  else
    perform 1
    from public.repairs
    where id = new.repair_id;

    if not found then
      raise exception
        'Release repair source % does not exist',
        new.repair_id
        using errcode = '23503';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists releases_validate_source
  on public.releases;

create trigger releases_validate_source
before insert or update on public.releases
for each row
execute function public.validate_release_source();


-- ============================================================
-- Release history protection
--
-- Source identity cannot be rewritten.
--
-- Once release_date has been populated, execution state becomes
-- immutable. The historical release event must not be reopened.
-- ============================================================

create or replace function public.guard_release_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id is distinct from new.id
     or old.release_code is distinct from new.release_code
     or old.source_type is distinct from new.source_type
     or old.return_id is distinct from new.return_id
     or old.repair_id is distinct from new.repair_id
     or old.created_at is distinct from new.created_at
  then
    raise exception
      'Release identity/history fields cannot be modified'
      using errcode = '55000';
  end if;

  if old.release_date is not null
     and (
       new.eligibility is distinct from old.eligibility
       or new.action is distinct from old.action
       or new.status is distinct from old.status
       or new.validation is distinct from old.validation
       or new.release_date is distinct from old.release_date
       or new.resulting_device_state is distinct from old.resulting_device_state
       or new.released_by_user_id is distinct from old.released_by_user_id
     )
  then
    raise exception
      'An executed release cannot be rewritten'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists releases_history_guard
  on public.releases;

create trigger releases_history_guard
before update on public.releases
for each row
execute function public.guard_release_history();


drop trigger if exists releases_set_updated_at
  on public.releases;

create trigger releases_set_updated_at
before update on public.releases
for each row
execute function public.set_updated_at();


-- ============================================================
-- Release delete protection
-- ============================================================

create or replace function public.prevent_release_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Release records are history-preserving; DELETE is not permitted'
    using errcode = '55000';
end;
$$;

drop trigger if exists releases_prevent_delete
  on public.releases;

create trigger releases_prevent_delete
before delete on public.releases
for each row
execute function public.prevent_release_delete();


-- ============================================================
-- Row Level Security
--
-- Authentication remains deferred during pilot schema work.
-- ============================================================

alter table public.returns enable row level security;
alter table public.returns force row level security;

alter table public.releases enable row level security;
alter table public.releases force row level security;

drop policy if exists returns_fail_closed
  on public.returns;

create policy returns_fail_closed
on public.returns
for all
to public
using (false)
with check (false);

drop policy if exists releases_fail_closed
  on public.releases;

create policy releases_fail_closed
on public.releases
for all
to public
using (false)
with check (false);

commit;
