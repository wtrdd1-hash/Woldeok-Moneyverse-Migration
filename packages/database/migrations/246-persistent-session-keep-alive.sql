-- 246-persistent-session-keep-alive.sql
--
-- Extends administrator session lifespan and idle timeout to prevent unexpected
-- logouts during active work, and implements auto-sliding session refresh.

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

  -- 30 days total lifetime, 24 hours idle window
  INSERT INTO public.auth_sessions (
    id, token_hash, csrf_hash, user_id, expires_at, created_at,
    prelogin_consent_version_id, prelogin_age_confirmed, prelogin_consented_at,
    reauthenticated_at, admin_opened_at, admin_last_seen_at, admin_rotated_from
  ) VALUES (
    pg_catalog.gen_random_uuid(), p_token_hash, p_csrf_hash, p_actor,
    v_now + pg_catalog.make_interval(days => 30), v_now,
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
                      v_now + pg_catalog.make_interval(days => 30),
                      v_now + pg_catalog.make_interval(hours => 24);
END;
$$;

ALTER FUNCTION public.admin_session_open(uuid, uuid, text, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_session_open(uuid, uuid, text, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_session_open(uuid, uuid, text, text) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_session_touch(
  p_session_id uuid,
  p_actor uuid
)
RETURNS TABLE(state text, expires_at timestamptz, idle_expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_session public.auth_sessions%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_new_expires_at timestamptz;
BEGIN
  IF p_session_id IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'session and actor are required';
  END IF;

  SELECT session_row.* INTO v_session
  FROM public.auth_sessions AS session_row
  WHERE session_row.id = p_session_id AND session_row.user_id = p_actor
  FOR UPDATE;

  IF NOT FOUND OR v_session.revoked_at IS NOT NULL THEN
    RETURN QUERY SELECT 'closed'::text, NULL::timestamptz, NULL::timestamptz;
    RETURN;
  END IF;

  IF v_session.admin_opened_at IS NULL OR v_session.admin_closed_at IS NOT NULL THEN
    RETURN QUERY SELECT 'none'::text, NULL::timestamptz, NULL::timestamptz;
    RETURN;
  END IF;

  IF v_session.expires_at <= v_now THEN
    RETURN QUERY SELECT 'expired'::text, v_session.expires_at, NULL::timestamptz;
    RETURN;
  END IF;

  -- 24 hours idle window check
  IF v_session.admin_last_seen_at + pg_catalog.make_interval(hours => 24) <= v_now THEN
    RETURN QUERY SELECT 'idle_locked'::text, v_session.expires_at,
                        v_session.admin_last_seen_at + pg_catalog.make_interval(hours => 24);
    RETURN;
  END IF;

  -- Auto-sliding renewal: if less than 7 days remain, slide back to 30 days
  IF v_session.expires_at < v_now + pg_catalog.make_interval(days => 7) THEN
    v_new_expires_at := v_now + pg_catalog.make_interval(days => 30);
    UPDATE public.auth_sessions AS session_row
    SET admin_last_seen_at = v_now,
        expires_at = v_new_expires_at
    WHERE session_row.id = p_session_id;
  ELSE
    v_new_expires_at := v_session.expires_at;
    UPDATE public.auth_sessions AS session_row
    SET admin_last_seen_at = v_now
    WHERE session_row.id = p_session_id;
  END IF;

  RETURN QUERY SELECT 'open'::text, v_new_expires_at,
                      v_now + pg_catalog.make_interval(hours => 24);
END;
$$;

ALTER FUNCTION public.admin_session_touch(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_session_touch(uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_session_touch(uuid, uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_recovery_code_open_session(
  p_session_id uuid,
  p_actor uuid,
  p_code_hash text,
  p_token_hash text,
  p_csrf_hash text
)
RETURNS TABLE(accepted boolean, session_id uuid, expires_at timestamptz, idle_expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_current public.auth_sessions%ROWTYPE;
  v_state public.admin_recovery_code_state%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_new uuid;
BEGIN
  IF p_session_id IS NULL OR p_actor IS NULL OR p_code_hash IS NULL
    OR coalesce(pg_catalog.char_length(p_token_hash), 0) < 32
    OR coalesce(pg_catalog.char_length(p_csrf_hash), 0) < 32 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid admin recovery session request';
  END IF;

  SELECT session_row.* INTO v_current
  FROM public.auth_sessions AS session_row
  WHERE session_row.id = p_session_id AND session_row.user_id = p_actor
    AND session_row.revoked_at IS NULL AND session_row.expires_at > v_now
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a live session for this actor is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  SELECT * INTO v_state FROM public.admin_recovery_code_state WHERE user_id = p_actor FOR UPDATE;
  IF FOUND AND v_state.locked_until IS NOT NULL AND v_state.locked_until > v_now THEN
    PERFORM public.admin_append_audit_event(
      p_actor, 'admin.recovery_code.rate_limited', p_actor, NULL,
      pg_catalog.jsonb_build_object('lockedUntil', v_state.locked_until)
    );
    RETURN QUERY SELECT false, NULL::uuid, NULL::timestamptz, v_state.locked_until;
    RETURN;
  END IF;

  UPDATE public.admin_recovery_codes c SET consumed_at = v_now
  WHERE c.user_id = p_actor AND c.code_hash = p_code_hash
    AND c.consumed_at IS NULL AND c.expires_at > v_now;
  IF NOT FOUND THEN
    INSERT INTO public.admin_recovery_code_state(user_id, failed_attempts, locked_until)
    VALUES (p_actor, 1, NULL)
    ON CONFLICT (user_id) DO UPDATE
      SET failed_attempts = public.admin_recovery_code_state.failed_attempts + 1,
          locked_until = CASE WHEN public.admin_recovery_code_state.failed_attempts + 1 >= 5
            THEN v_now + interval '15 minutes'
            ELSE public.admin_recovery_code_state.locked_until END;
    PERFORM public.admin_append_audit_event(
      p_actor, 'admin.recovery_code.failed', p_actor, NULL,
      pg_catalog.jsonb_build_object('outcome', 'rejected')
    );
    RETURN QUERY SELECT false, NULL::uuid, NULL::timestamptz, NULL::timestamptz;
    RETURN;
  END IF;

  INSERT INTO public.admin_recovery_code_state(user_id, failed_attempts, locked_until)
  VALUES (p_actor, 0, NULL)
  ON CONFLICT (user_id) DO UPDATE SET failed_attempts = 0, locked_until = NULL;

  INSERT INTO public.auth_sessions(
    id, token_hash, csrf_hash, user_id, expires_at, created_at,
    prelogin_consent_version_id, prelogin_age_confirmed, prelogin_consented_at,
    reauthenticated_at, admin_opened_at, admin_last_seen_at, admin_rotated_from
  ) VALUES (
    pg_catalog.gen_random_uuid(), p_token_hash, p_csrf_hash, p_actor,
    v_now + interval '30 days', v_now,
    v_current.prelogin_consent_version_id, v_current.prelogin_age_confirmed,
    v_current.prelogin_consented_at, v_current.reauthenticated_at, v_now, v_now, p_session_id
  ) RETURNING id INTO v_new;

  UPDATE public.auth_sessions SET revoked_at = v_now, admin_closed_at = v_now
  WHERE id = p_session_id;

  PERFORM public.admin_append_audit_event(
    p_actor, 'admin.recovery_code.consumed', v_new, NULL,
    pg_catalog.jsonb_build_object('credentialId', (
      SELECT id FROM public.admin_recovery_codes
      WHERE user_id = p_actor AND code_hash = p_code_hash AND consumed_at = v_now LIMIT 1
    ))
  );

  RETURN QUERY SELECT true, v_new, v_now + interval '30 days', v_now + interval '24 hours';
END;
$$;

ALTER FUNCTION public.admin_recovery_code_open_session(uuid, uuid, text, text, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_recovery_code_open_session(uuid, uuid, text, text, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_recovery_code_open_session(uuid, uuid, text, text, text) TO moneyverse_app;
