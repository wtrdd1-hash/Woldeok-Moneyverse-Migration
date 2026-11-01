BEGIN;

-- Migration 265 granted the web role a SECURITY DEFINER settlement entrypoint
-- without a season-end or operator boundary. The v727 HTTP hold is not a DB ACL.
-- Do not restore execution until a separately reviewed operator-only, deadline-
-- checked, idempotent and auditable settlement path is available.
REVOKE EXECUTE ON FUNCTION public.season_settle_rewards(uuid)
  FROM PUBLIC, moneyverse_app;

COMMIT;
