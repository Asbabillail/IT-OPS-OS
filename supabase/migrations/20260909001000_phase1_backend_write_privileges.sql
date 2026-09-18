begin;

-- Phase 1 backend write privileges for service_role.
--
-- The application's Supabase secret key authenticates through the
-- PostgreSQL service_role. This grant enables INSERT/UPDATE operations
-- on the core workflow tables, scoped to the workflows that have write
-- operations implemented:
--
--   - Distribution: student device handover workflow
--   - BYOD: bring-your-own-device workflow
--   - Repairs: device repair workflow
--   - AppleCare: AppleCare claims workflow
--   - Returns: device return workflow
--   - Releases: device release workflow
--   - Timeline/Audit: event logging for all workflows
--
-- DELETE is intentionally not granted — all records are history-preserving.

grant insert, update on table
  public.distributions,
  public.byod_records,
  public.repairs,
  public.applecare_claims,
  public.returns,
  public.releases,
  public.timeline_events,
  public.audit_events
to service_role;

commit;
