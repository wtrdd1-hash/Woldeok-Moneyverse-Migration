-- Migration 356: owner-scoped credential reads for the API's session and reauthentication paths.
--
-- The API's sign-in, session hydration and reauthentication read auth_local_credentials
-- directly, which the application role is not granted in the migration chain (AGENTS.md: a read
-- path needs a function, not a grant). Sign-in already has auth_local_credential_for_login (180).
-- These two cover the remaining reads; each returns only the caller's own active credential.

BEGIN;

CREATE OR REPLACE FUNCTION public.auth_local_email_for_actor(p_actor uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT credential.email
  FROM public.auth_local_credentials AS credential
  JOIN public.users AS user_row ON user_row.id = credential.user_id
  WHERE credential.user_id = p_actor
    AND credential.disabled_at IS NULL
    AND user_row.status = 'active'::public.user_status
  LIMIT 1
$$;

-- Returns the verifier only for an active account with a live session, so the function cannot
-- be used to fetch verifiers for arbitrary user ids without that user's session.
CREATE OR REPLACE FUNCTION public.auth_local_verifier_for_actor(p_actor uuid, p_session_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT credential.password_verifier
  FROM public.auth_local_credentials AS credential
  JOIN public.users AS user_row ON user_row.id = credential.user_id
  WHERE credential.user_id = p_actor
    AND credential.disabled_at IS NULL
    AND user_row.status = 'active'::public.user_status
    AND EXISTS (
      SELECT 1 FROM public.auth_sessions AS session_row
      WHERE session_row.id = p_session_id
        AND session_row.user_id = p_actor
        AND session_row.revoked_at IS NULL
        AND session_row.expires_at > pg_catalog.now())
  LIMIT 1
$$;

ALTER FUNCTION public.auth_local_email_for_actor(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.auth_local_verifier_for_actor(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_local_email_for_actor(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_local_verifier_for_actor(uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_local_email_for_actor(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_local_verifier_for_actor(uuid, uuid) TO moneyverse_app;

COMMIT;
