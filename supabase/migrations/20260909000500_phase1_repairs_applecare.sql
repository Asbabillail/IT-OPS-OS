begin;

-- ============================================================
-- Repair workflow
--
-- TypeScript RepairRecord mapping:
--
--   id                 -> repair_code
--   deviceSerial       -> device_id -> devices.serial
--   ownerStudentId     -> owner_student_id
--   issue              -> issue
--   priority           -> priority
--   status             -> status
--   openedDate         -> opened_date
--   diagnosis          -> diagnosis
--   serviceRoute       -> service_route
--   sentForServiceDate -> sent_for_service_date
--   completedDate      -> completed_date
--   verifiedDate       -> verified_date
-- ============================================================

create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),

  repair_code text not null,

  device_id uuid not null
    references public.devices(id)
    on update restrict
    on delete restrict,

  owner_student_id uuid
    references public.students(id)
    on update restrict
    on delete restrict,

  issue text not null,
  priority text not null,
  status text not null,

  opened_date date not null,

  diagnosis text not null,
  service_route text not null,

  sent_for_service_date date not null,
  completed_date date,
  verified_date date,

  verified_by_user_id uuid
    references public.app_users(id)
    on update restrict
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint repairs_code_not_blank
    check (btrim(repair_code) <> ''),

  constraint repairs_code_format
    check (repair_code like 'REP-%'),

  constraint repairs_code_key
    unique (repair_code),

  constraint repairs_issue_not_blank
    check (btrim(issue) <> ''),

  constraint repairs_diagnosis_not_blank
    check (btrim(diagnosis) <> ''),

  constraint repairs_priority_valid
    check (
      priority in (
        'High',
        'Medium',
        'Low'
      )
    ),

  constraint repairs_status_valid
    check (
      status in (
        'In Repair',
        'Awaiting Parts'
      )
    ),

  constraint repairs_service_route_valid
    check (
      service_route in (
        'External Service',
        'Internal Repair'
      )
    ),

  constraint repairs_service_chronology
    check (
      sent_for_service_date >= opened_date
    ),

  constraint repairs_completion_chronology
    check (
      completed_date is null
      or completed_date >= sent_for_service_date
    ),

  constraint repairs_verification_chronology
    check (
      verified_date is null
      or (
        completed_date is not null
        and verified_date >= completed_date
      )
    ),

  constraint repairs_verifier_requires_verification_date
    check (
      verified_by_user_id is null
      or verified_date is not null
    )
);

create index if not exists repairs_device_idx
  on public.repairs (device_id, opened_date desc);

create index if not exists repairs_owner_student_idx
  on public.repairs (owner_student_id)
  where owner_student_id is not null;

create index if not exists repairs_status_idx
  on public.repairs (status);

create index if not exists repairs_priority_idx
  on public.repairs (priority);

create index if not exists repairs_opened_date_idx
  on public.repairs (opened_date desc);


-- ============================================================
-- Repair identity/history protection
--
-- The incident identity, device, owner snapshot and original open
-- date cannot be rewritten after creation.
--
-- Diagnosis, status and service lifecycle fields remain mutable
-- because they evolve during the repair workflow.
-- ============================================================

create or replace function public.guard_repair_identity_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id is distinct from new.id
     or old.repair_code is distinct from new.repair_code
     or old.device_id is distinct from new.device_id
     or old.owner_student_id is distinct from new.owner_student_id
     or old.issue is distinct from new.issue
     or old.opened_date is distinct from new.opened_date
     or old.created_at is distinct from new.created_at
  then
    raise exception
      'Repair identity/history fields cannot be modified'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists repairs_history_guard
  on public.repairs;

create trigger repairs_history_guard
before update on public.repairs
for each row
execute function public.guard_repair_identity_history();


drop trigger if exists repairs_set_updated_at
  on public.repairs;

create trigger repairs_set_updated_at
before update on public.repairs
for each row
execute function public.set_updated_at();


-- ============================================================
-- Repair delete protection
-- ============================================================

create or replace function public.prevent_repair_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Repair records are history-preserving; DELETE is not permitted'
    using errcode = '55000';
end;
$$;

drop trigger if exists repairs_prevent_delete
  on public.repairs;

create trigger repairs_prevent_delete
before delete on public.repairs
for each row
execute function public.prevent_repair_delete();


-- ============================================================
-- AppleCare workflow
--
-- Device and student are deliberately NOT duplicated here.
-- They are derived from repair_id:
--
--   applecare_claims -> repairs -> devices / students
--
-- TypeScript AppleCareClaim mapping:
--
--   id             -> claim_code
--   deviceSerial   -> derived through repair
--   repairId       -> repair_id
--   ownerStudentId -> derived through repair
--   coverage       -> coverage
--   claimStatus    -> claim_status
--   issue          -> issue
--   serviceType    -> service_type
--   submittedDate  -> submitted_date
--   decisionDate   -> decision_date
-- ============================================================

create table if not exists public.applecare_claims (
  id uuid primary key default gen_random_uuid(),

  claim_code text not null,

  repair_id uuid not null
    references public.repairs(id)
    on update restrict
    on delete restrict,

  coverage text not null,
  claim_status text not null,

  issue text not null,
  service_type text not null,

  submitted_date date,
  decision_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint applecare_claims_code_not_blank
    check (btrim(claim_code) <> ''),

  constraint applecare_claims_code_format
    check (claim_code like 'AC-%'),

  constraint applecare_claims_code_key
    unique (claim_code),

  constraint applecare_claims_repair_key
    unique (repair_id),

  constraint applecare_claims_coverage_valid
    check (
      coverage = 'Active'
    ),

  constraint applecare_claims_status_valid
    check (
      claim_status in (
        'Submitted',
        'Not Required'
      )
    ),

  constraint applecare_claims_issue_valid
    check (
      issue in (
        'Accidental Damage',
        'Battery Service'
      )
    ),

  constraint applecare_claims_service_type_valid
    check (
      service_type in (
        'Display Repair',
        'Internal Battery Service'
      )
    ),

  constraint applecare_claims_submission_state_consistent
    check (
      (
        claim_status = 'Submitted'
        and submitted_date is not null
      )
      or
      (
        claim_status = 'Not Required'
        and submitted_date is null
        and decision_date is null
      )
    ),

  constraint applecare_claims_decision_chronology
    check (
      decision_date is null
      or (
        submitted_date is not null
        and decision_date >= submitted_date
      )
    )
);

create index if not exists applecare_claims_status_idx
  on public.applecare_claims (claim_status);

create index if not exists applecare_claims_submitted_date_idx
  on public.applecare_claims (submitted_date desc)
  where submitted_date is not null;


-- ============================================================
-- AppleCare history protection
--
-- Claim identity and repair relationship cannot be rewritten.
-- Operational claim state and dates may progress.
-- ============================================================

create or replace function public.guard_applecare_identity_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id is distinct from new.id
     or old.claim_code is distinct from new.claim_code
     or old.repair_id is distinct from new.repair_id
     or old.created_at is distinct from new.created_at
  then
    raise exception
      'AppleCare claim identity/history fields cannot be modified'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists applecare_claims_history_guard
  on public.applecare_claims;

create trigger applecare_claims_history_guard
before update on public.applecare_claims
for each row
execute function public.guard_applecare_identity_history();


drop trigger if exists applecare_claims_set_updated_at
  on public.applecare_claims;

create trigger applecare_claims_set_updated_at
before update on public.applecare_claims
for each row
execute function public.set_updated_at();


-- ============================================================
-- AppleCare delete protection
-- ============================================================

create or replace function public.prevent_applecare_claim_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'AppleCare claim records are history-preserving; DELETE is not permitted'
    using errcode = '55000';
end;
$$;

drop trigger if exists applecare_claims_prevent_delete
  on public.applecare_claims;

create trigger applecare_claims_prevent_delete
before delete on public.applecare_claims
for each row
execute function public.prevent_applecare_claim_delete();


-- ============================================================
-- Row Level Security
--
-- Pilot authentication remains deferred.
-- Keep repair and AppleCare access fail-closed.
-- ============================================================

alter table public.repairs enable row level security;
alter table public.repairs force row level security;

alter table public.applecare_claims enable row level security;
alter table public.applecare_claims force row level security;

drop policy if exists repairs_fail_closed
  on public.repairs;

create policy repairs_fail_closed
on public.repairs
for all
to public
using (false)
with check (false);

drop policy if exists applecare_claims_fail_closed
  on public.applecare_claims;

create policy applecare_claims_fail_closed
on public.applecare_claims
for all
to public
using (false)
with check (false);

commit;
