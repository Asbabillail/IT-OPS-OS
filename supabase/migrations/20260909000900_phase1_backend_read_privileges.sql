begin;

-- Phase 1 backend Data API privileges.
--
-- The application's Supabase secret key authenticates through the
-- PostgreSQL service_role. RLS bypass alone does not grant object-level
-- table/function privileges, so these grants are required explicitly.
--
-- Keep this migration read-only. Mutation privileges will be granted
-- separately as write workflows are implemented.

grant usage on schema public to service_role;

grant select on table
  public.students,
  public.faculty,
  public.devices,
  public.device_assignments,
  public.timeline_events,
  public.audit_events,
  public.app_users,
  public.app_roles,
  public.user_role_assignments,
  public.distributions,
  public.byod_records,
  public.repairs,
  public.applecare_claims,
  public.returns,
  public.releases,
  public.document_records,
  public.search_documents
to service_role;

grant execute on function public.search_phase1(text, text[], integer)
to service_role;

commit;
