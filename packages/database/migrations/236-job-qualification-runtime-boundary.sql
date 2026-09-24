-- 236-job-qualification-runtime-boundary.sql
-- Restore least-privilege boundaries for the qualification feature introduced by migration 234.
-- Migration 234 may already be applied, so this correction is intentionally additive/immutable.

REVOKE ALL ON TABLE public.user_job_qualifications FROM moneyverse_app;
GRANT SELECT ON TABLE public.user_job_qualifications TO moneyverse_app;

REVOKE ALL ON FUNCTION public.job_certify_qualification(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.job_certify_qualification(uuid, text, text) TO moneyverse_app;
