-- The operations console is readable only by an administrator and its API
-- still checks the role on every request. Requiring an enrolled TOTP merely
-- to enter made a newly signed-in administrator unable to use the console on
-- a phone. A current authenticated administrator session is sufficient for
-- entry; high-risk commands retain their own immediate step-up guards.
CREATE OR REPLACE FUNCTION public.admin_session_open(
  p_session_id uuid,
  p_actor uuid,
  p_token_hash text,
  p_csrf_hash text
)
RETURNS TABLE(session_id uuid, expires_at timestamptz, idle_expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_current public.auth_sessions%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_new uuid;
BEGIN
  IF p_session_id IS NULL OR p_actor IS NULL
    OR coalesce(pg_catalog.char_length(p_token_hash), 0) < 32
    OR coalesce(pg_catalog.char_length(p_csrf_hash), 0) < 32 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid admin session request';
  END IF;

  SELECT session_row.* INTO v_current
  FROM public.auth_sessions AS session_row
  WHERE session_row.id = p_session_id
    AND session_row.user_id = p_actor
    AND session_row.revoked_at IS NULL
    AND session_row.expires_at > v_now
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'a live session for this actor is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  INSERT INTO public.auth_sessions (
    id, token_hash, csrf_hash, user_id, expires_at, created_at,
    prelogin_consent_version_id, prelogin_age_confirmed, prelogin_consented_at,
    reauthenticated_at, admin_opened_at, admin_last_seen_at, admin_rotated_from
  ) VALUES (
    pg_catalog.gen_random_uuid(), p_token_hash, p_csrf_hash, p_actor,
    v_now + pg_catalog.make_interval(mins => 30), v_now,
    v_current.prelogin_consent_version_id, v_current.prelogin_age_confirmed,
    v_current.prelogin_consented_at, v_current.reauthenticated_at, v_now, v_now, p_session_id
  )
  RETURNING id INTO v_new;

  UPDATE public.auth_sessions AS session_row
  SET revoked_at = v_now, admin_closed_at = v_now
  WHERE session_row.id = p_session_id;

  PERFORM public.admin_append_audit_event(
    p_actor, 'admin.session.opened', v_new, NULL,
    pg_catalog.jsonb_build_object('rotatedFrom', p_session_id::text, 'entryProof', 'authenticated_admin_session')
  );

  RETURN QUERY SELECT v_new,
                      v_now + pg_catalog.make_interval(mins => 30),
                      v_now + pg_catalog.make_interval(mins => 10);
END;
$$;

ALTER FUNCTION public.admin_session_open(uuid, uuid, text, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_session_open(uuid, uuid, text, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_session_open(uuid, uuid, text, text) TO moneyverse_app;
