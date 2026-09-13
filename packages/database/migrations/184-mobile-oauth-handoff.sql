-- 184-mobile-oauth-handoff.sql
-- Update version: v2026.09.13.49
-- Native OAuth completes in the system browser, then hands the authenticated
-- identity back to the app through a short-lived, single-use opaque code.

BEGIN;

ALTER TABLE public.oauth_challenges
  ADD COLUMN IF NOT EXISTS mobile_client boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.oauth_mobile_handoffs (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS oauth_mobile_handoffs_active
  ON public.oauth_mobile_handoffs(expires_at)
  WHERE consumed_at IS NULL;

CREATE OR REPLACE FUNCTION public.auth_create_mobile_oauth_handoff(
  p_user_id uuid,
  p_token_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_inserted integer;
BEGIN
  IF p_user_id IS NULL OR p_token_hash IS NULL OR length(p_token_hash) < 32 THEN
    RETURN false;
  END IF;

  INSERT INTO public.oauth_mobile_handoffs(token_hash, user_id, expires_at)
  SELECT p_token_hash, user_row.id, pg_catalog.clock_timestamp() + interval '5 minutes'
  FROM public.users AS user_row
  WHERE user_row.id = p_user_id
  ON CONFLICT (token_hash) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_consume_mobile_oauth_handoff(
  p_token_hash text,
  p_session_token_hash text,
  p_csrf_hash text
)
RETURNS TABLE(user_id uuid, session_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_session_id uuid := pg_catalog.gen_random_uuid();
BEGIN
  UPDATE public.oauth_mobile_handoffs AS handoff_row
  SET consumed_at = pg_catalog.clock_timestamp()
  WHERE handoff_row.token_hash = p_token_hash
    AND handoff_row.consumed_at IS NULL
    AND handoff_row.expires_at > pg_catalog.clock_timestamp()
  RETURNING handoff_row.user_id INTO v_user_id;

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.auth_sessions(
    id, token_hash, csrf_hash, user_id, expires_at, reauthenticated_at
  ) VALUES (
    v_session_id,
    p_session_token_hash,
    p_csrf_hash,
    v_user_id,
    pg_catalog.clock_timestamp() + interval '30 days',
    pg_catalog.clock_timestamp()
  );

  user_id := v_user_id;
  session_id := v_session_id;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.auth_create_mobile_oauth_handoff(uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.auth_consume_mobile_oauth_handoff(text, text, text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.auth_create_mobile_oauth_handoff(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_consume_mobile_oauth_handoff(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_create_mobile_oauth_handoff(uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_consume_mobile_oauth_handoff(text, text, text) TO moneyverse_app;

COMMIT;
