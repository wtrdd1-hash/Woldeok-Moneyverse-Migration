-- 235-disable-direct-work-completion.sql
-- v2026.09.24.434
-- G433-01: paid work must pass assignment + authoritative elapsed-time + verification.
-- Keep the legacy function for historical/migrator tests, but remove runtime-app execution.

BEGIN;

REVOKE EXECUTE ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid)
  FROM moneyverse_app;

COMMENT ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) IS
  'Legacy direct completion primitive. Runtime application execution revoked by migration 235; use work_assign_task -> work_submit_completion -> work_verify_and_reward.';

COMMIT;
