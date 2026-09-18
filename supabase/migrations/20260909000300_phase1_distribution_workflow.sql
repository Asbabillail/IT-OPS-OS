begin;

-- ============================================================
-- Student device distribution workflow
--
-- device_assignments remains authoritative for device assignment
-- history. This table tracks the physical paper-signature and
-- verification workflow associated with a student handover.
--
-- TypeScript DistributionRecord mapping:
--
--   id              -> distribution_code
--   studentId       -> derived through device_assignments.student_id
--   deviceSerial    -> derived through device_assignments.device_id
--   status          -> workflow_status
--   signatureStatus -> signature_status
--   handoverDate    -> handover_date
--   returnedDate    -> paper_returned_date
--   verifiedDate    -> verified_date
--
-- No signature image or signature binary is stored here.
-- ============================================================

create table if not exists public.distributions (
  id uuid primary key default gen_random_uuid(),

  distribution_code text not null,

  assignment_id uuid not null
    references public.device_assignments(id)
    on update restrict
    on delete restrict,

  workflow_status text not null,
  signature_status text not null,

  handover_date date not null,
  paper_returned_date date,
  verified_date date,

  verified_by_user_id uuid
    references public.app_users(id)
    on update restrict
    on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint distributions_distribution_code_not_blank
    check (btrim(distribution_code) <> ''),

  constraint distributions_distribution_code_format
    check (distribution_code like 'DIST-%'),

  constraint distributions_distribution_code_key
    unique (distribution_code),

  constraint distributions_assignment_key
    unique (assignment_id),

  constraint distributions_workflow_status_valid
    check (
      workflow_status in (
        'Pending Signature',
        'Verified'
      )
    ),

  constraint distributions_signature_status_valid
    check (
      signature_status in (
        'Awaiting Paper Return',
        'Verified'
      )
    ),

  constraint distributions_paper_return_chronology
    check (
      paper_returned_date is null
      or paper_returned_date >= handover_date
    ),

  constraint distributions_verification_chronology
    check (
      verified_date is null
      or verified_date >= handover_date
    ),

  constraint distributions_verification_after_paper_return
    check (
      verified_date is null
      or paper_returned_date is null
      or verified_date >= paper_returned_date
    ),

  constraint distributions_workflow_state_consistent
    check (
      (
        workflow_status = 'Pending Signature'
        and signature_status = 'Awaiting Paper Return'
        and paper_returned_date is null
        and verified_date is null
        and verified_by_user_id is null
      )
      or
      (
        workflow_status = 'Verified'
        and signature_status = 'Verified'
        and paper_returned_date is not null
        and verified_date is not null
      )
    )
);

create index if not exists distributions_workflow_status_idx
  on public.distributions (workflow_status);

create index if not exists distributions_handover_date_idx
  on public.distributions (handover_date desc);

create index if not exists distributions_verified_by_user_idx
  on public.distributions (verified_by_user_id)
  where verified_by_user_id is not null;


-- ============================================================
-- Distribution assignment validation
--
-- A distribution is student-only and must reference a Student
-- device assignment.
-- ============================================================

create or replace function public.validate_distribution_assignment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  assignment_record public.device_assignments%rowtype;
begin
  select *
  into assignment_record
  from public.device_assignments
  where id = new.assignment_id;

  if not found then
    raise exception
      'Distribution assignment % does not exist',
      new.assignment_id
      using errcode = '23503';
  end if;

  if assignment_record.assignee_type <> 'Student'
     or assignment_record.student_id is null
     or assignment_record.faculty_id is not null
  then
    raise exception
      'Distribution % must reference a Student device assignment',
      new.distribution_code
      using errcode = '23514';
  end if;

  if new.handover_date < assignment_record.assigned_at::date then
    raise exception
      'Distribution handover date cannot precede assignment date'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists distributions_validate_assignment
  on public.distributions;

create trigger distributions_validate_assignment
before insert or update on public.distributions
for each row
execute function public.validate_distribution_assignment();


-- ============================================================
-- History-preserving workflow guard
--
-- Distribution identity and handover relationship cannot be
-- rewritten after creation.
--
-- Verified workflows cannot be reverted to Pending Signature.
-- Corrections must be represented through audit/timeline history,
-- not destructive rewriting of completed workflow state.
-- ============================================================

create or replace function public.guard_distribution_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.id is distinct from new.id
     or old.distribution_code is distinct from new.distribution_code
     or old.assignment_id is distinct from new.assignment_id
     or old.handover_date is distinct from new.handover_date
     or old.created_at is distinct from new.created_at
  then
    raise exception
      'Distribution identity/history fields cannot be modified'
      using errcode = '55000';
  end if;

  if old.workflow_status = 'Verified'
     and (
       new.workflow_status is distinct from old.workflow_status
       or new.signature_status is distinct from old.signature_status
       or new.paper_returned_date is distinct from old.paper_returned_date
       or new.verified_date is distinct from old.verified_date
       or new.verified_by_user_id is distinct from old.verified_by_user_id
     )
  then
    raise exception
      'A verified distribution cannot be rewritten'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists distributions_history_guard
  on public.distributions;

create trigger distributions_history_guard
before update on public.distributions
for each row
execute function public.guard_distribution_history();


drop trigger if exists distributions_set_updated_at
  on public.distributions;

create trigger distributions_set_updated_at
before update on public.distributions
for each row
execute function public.set_updated_at();


-- ============================================================
-- Delete protection
--
-- Distribution records are operational history and therefore
-- cannot be deleted.
-- ============================================================

create or replace function public.prevent_distribution_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Distribution records are history-preserving; DELETE is not permitted'
    using errcode = '55000';
end;
$$;

drop trigger if exists distributions_prevent_delete
  on public.distributions;

create trigger distributions_prevent_delete
before delete on public.distributions
for each row
execute function public.prevent_distribution_delete();


-- ============================================================
-- Row Level Security
--
-- Pilot authentication is not connected yet.
-- Distribution access therefore remains fail-closed.
-- ============================================================

alter table public.distributions enable row level security;
alter table public.distributions force row level security;

drop policy if exists distributions_fail_closed
  on public.distributions;

create policy distributions_fail_closed
on public.distributions
for all
to public
using (false)
with check (false);

commit;
