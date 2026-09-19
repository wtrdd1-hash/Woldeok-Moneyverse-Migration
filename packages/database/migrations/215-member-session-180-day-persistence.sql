-- 215-member-session-180-day-persistence.sql
-- Update version: v2026.09.19.291
--
-- Keep ordinary member logins durable across host/process restarts and reduce
-- unnecessary reauthentication. Pre-login sessions and privileged admin
-- console lifetimes remain independently bounded.

BEGIN;

CREATE OR REPLACE FUNCTION public.auth_member_session_long_lifetime()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL
     AND NEW.admin_opened_at IS NULL
     AND NEW.revoked_at IS NULL THEN
    NEW.expires_at := GREATEST(
      NEW.expires_at,
      pg_catalog.clock_timestamp() + interval '180 days'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auth_member_session_long_lifetime_insert ON public.auth_sessions;
CREATE TRIGGER auth_member_session_long_lifetime_insert
BEFORE INSERT ON public.auth_sessions
FOR EACH ROW
EXECUTE FUNCTION public.auth_member_session_long_lifetime();

UPDATE public.auth_sessions
SET expires_at = pg_catalog.clock_timestamp() + interval '180 days'
WHERE user_id IS NOT NULL
  AND admin_opened_at IS NULL
  AND revoked_at IS NULL
  AND expires_at > pg_catalog.clock_timestamp();

ALTER FUNCTION public.auth_member_session_long_lifetime() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.auth_member_session_long_lifetime() FROM PUBLIC;

COMMIT;
