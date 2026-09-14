-- 185-local-email-token-verification.sql
-- Update version: v2026.09.14.75
-- Allow a one-time email verification token to complete registration even when
-- the link is opened outside the app's original browser/cookie jar.
BEGIN;

CREATE OR REPLACE FUNCTION public.auth_complete_local_registration_by_token(
  p_verification_token_hash text,
  p_session_token_hash text,
  p_csrf_hash text
)
RETURNS TABLE(user_id uuid, session_id uuid, is_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_pre_auth_session_id uuid;
BEGIN
  IF p_verification_token_hash IS NULL OR p_verification_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid verification token hash' USING ERRCODE = '22023';
  END IF;

  SELECT registration.pre_auth_session_id
  INTO v_pre_auth_session_id
  FROM public.auth_local_registrations AS registration
  JOIN public.auth_sessions AS session_row ON session_row.id = registration.pre_auth_session_id
  WHERE registration.verification_token_hash = p_verification_token_hash
    AND registration.consumed_at IS NULL
    AND registration.expires_at > pg_catalog.now()
    AND session_row.user_id IS NULL
    AND session_row.revoked_at IS NULL
    AND session_row.expires_at > pg_catalog.now()
  FOR UPDATE OF registration, session_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'verification token invalid or expired' USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  SELECT * FROM public.auth_complete_local_registration(
    v_pre_auth_session_id,
    p_verification_token_hash,
    p_session_token_hash,
    p_csrf_hash
  );
END;
$$;

ALTER FUNCTION public.auth_complete_local_registration_by_token(text, text, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_complete_local_registration_by_token(text, text, text)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_complete_local_registration_by_token(text, text, text)
  TO moneyverse_app;

COMMIT;
