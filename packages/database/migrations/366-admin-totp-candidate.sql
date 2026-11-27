-- Independent administrator TOTP — candidate (v2026.11.27 owner-delegated direction).
--
-- WHY THIS EXISTS AFTER 197. 197 retired the TOTP factor 058 introduced. Since then the only
-- step-up an administrator write needs is re-entering the password in the same session, which is
-- the same knowledge factor again. This re-introduces an independent possession factor as a new,
-- forward-only migration; 058 and 197 are history and are not edited.
--
-- WHAT IS DIFFERENT FROM 058. 058 recorded one actor-wide "last verified" time, so a code typed in
-- any session satisfied every session of that administrator and every operation. Here a verified
-- code mints a proof bound to (actor, session, scope) that lives five minutes, and a session that
-- is revoked, expired or logged out takes its proofs with it.
--
-- WHY THE DATABASE STILL NEVER HOLDS A USABLE FACTOR. Same reason 058 gave: the shared secret is
-- sealed by the application with a key that exists only in the environment. The application
-- decides whether a code matches; this schema decides everything the application must not decide
-- alone -- whether the claimed step is plausibly now, whether it was already spent, how many
-- failures have accumulated, and whether a proof exists for this session and scope.
-- Computing the HMAC here with pgcrypto was rejected for the reason 058 rejected it: one dump
-- would then yield working codes.
--
-- ENFORCEMENT. Seeded switch 'admin_totp_required' is 'disabled', so merging this changes nothing
-- for an administrator who has not enrolled. An enrolled administrator is enforced regardless of
-- the switch; turning the switch on (an owner rollout decision) enforces every administrator.

BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_totp_credentials (
  user_id uuid PRIMARY KEY REFERENCES public.users(id),
  -- Base64 of nonce || ciphertext || tag, sealed by the application with AAD userId|keyId.
  secret_ciphertext text NOT NULL CHECK (pg_catalog.char_length(secret_ciphertext) BETWEEN 32 AND 512),
  key_id text NOT NULL CHECK (key_id ~ '^[a-z0-9][a-z0-9_.:-]{0,63}$'),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  confirmed_at timestamptz,
  -- Monotonic: a step at or below this one is a replay, whichever session presents it.
  last_step bigint,
  failed_attempts integer NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  locked_until timestamptz
);
REVOKE ALL PRIVILEGES ON TABLE public.admin_totp_credentials FROM PUBLIC, moneyverse_app;

CREATE TABLE IF NOT EXISTS public.admin_totp_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  session_id uuid NOT NULL REFERENCES public.auth_sessions(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('totp.manage', 'role.manage', 'economy.treasury',
    'member.lifecycle', 'security.settings', 'backup.restore')),
  step bigint NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_totp_proofs_lookup
  ON public.admin_totp_proofs (user_id, session_id, scope, expires_at);
REVOKE ALL PRIVILEGES ON TABLE public.admin_totp_proofs FROM PUBLIC, moneyverse_app;

-- Failed attempts per session, so one stolen session cannot keep guessing across lock windows.
CREATE TABLE IF NOT EXISTS public.admin_totp_attempts (
  session_id uuid NOT NULL REFERENCES public.auth_sessions(id) ON DELETE CASCADE,
  attempted_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
CREATE INDEX IF NOT EXISTS admin_totp_attempts_window
  ON public.admin_totp_attempts (session_id, attempted_at);
REVOKE ALL PRIVILEGES ON TABLE public.admin_totp_attempts FROM PUBLIC, moneyverse_app;

INSERT INTO public.feature_switches (feature_key, state, title, activation_preconditions, reason)
VALUES (
  'admin_totp_required',
  'disabled',
  'Administrator TOTP required',
  '[]'::jsonb,
  'candidate: enrolled administrators are enforced regardless; enabling this enforces every administrator (owner rollout decision)'
)
ON CONFLICT (feature_key) DO NOTHING;

-- Internal helpers: no grant to the application.

CREATE OR REPLACE FUNCTION public.admin_totp_live_session(p_actor uuid, p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_sessions AS s
    WHERE s.id = p_session_id AND s.user_id = p_actor
      AND s.revoked_at IS NULL AND s.expires_at > pg_catalog.clock_timestamp()
  )
$$;

CREATE OR REPLACE FUNCTION public.admin_totp_current_step()
RETURNS bigint
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT pg_catalog.floor(extract(epoch FROM pg_catalog.clock_timestamp()) / 30)::bigint
$$;

CREATE OR REPLACE FUNCTION public.admin_totp_is_admin(p_actor uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT p_actor IS NOT NULL AND EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor))
$$;

-- Callable surface.

CREATE OR REPLACE FUNCTION public.admin_totp_proof_valid(p_actor uuid, p_session_id uuid, p_scope text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT public.admin_totp_is_admin(p_actor)
     AND public.admin_totp_live_session(p_actor, p_session_id)
     AND EXISTS (
       SELECT 1 FROM public.admin_totp_proofs AS p
       WHERE p.user_id = p_actor AND p.session_id = p_session_id AND p.scope = p_scope
         AND p.expires_at > pg_catalog.clock_timestamp()
     )
$$;

CREATE OR REPLACE FUNCTION public.admin_totp_requirement(p_actor uuid)
RETURNS TABLE(enrolled boolean, enforced boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_enrolled boolean;
  v_admin boolean;
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;
  v_admin := public.admin_totp_is_admin(p_actor);
  SELECT EXISTS (
    SELECT 1 FROM public.admin_totp_credentials AS c
    WHERE c.user_id = p_actor AND c.confirmed_at IS NOT NULL
  ) INTO v_enrolled;
  RETURN QUERY SELECT v_enrolled,
    v_admin AND (v_enrolled OR public.feature_switch_state('admin_totp_required') = 'enabled');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_totp_begin_enrolment(
  p_actor uuid, p_session_id uuid, p_secret_ciphertext text, p_key_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_replaced boolean := false;
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL OR p_secret_ciphertext IS NULL OR p_key_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid second factor enrolment';
  END IF;
  IF NOT public.admin_totp_is_admin(p_actor) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;
  IF NOT public.admin_totp_live_session(p_actor, p_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a live session for this actor is required';
  END IF;
  IF NOT public.auth_session_has_recent_reauthentication(p_session_id, 900) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'recent reauthentication required';
  END IF;

  SELECT c.confirmed_at IS NOT NULL INTO v_replaced
  FROM public.admin_totp_credentials AS c WHERE c.user_id = p_actor FOR UPDATE;
  v_replaced := coalesce(v_replaced, false);

  -- A stolen session plus password must not be able to swap in the thief's own factor.
  IF v_replaced AND NOT public.admin_totp_proof_valid(p_actor, p_session_id, 'totp.manage') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current second factor proof required';
  END IF;

  INSERT INTO public.admin_totp_credentials AS c (user_id, secret_ciphertext, key_id)
  VALUES (p_actor, p_secret_ciphertext, p_key_id)
  ON CONFLICT (user_id) DO UPDATE
  SET secret_ciphertext = EXCLUDED.secret_ciphertext,
      key_id = EXCLUDED.key_id,
      created_at = pg_catalog.clock_timestamp(),
      confirmed_at = NULL,
      last_step = NULL,
      failed_attempts = 0,
      locked_until = NULL;
  DELETE FROM public.admin_totp_proofs AS p WHERE p.user_id = p_actor;

  PERFORM public.admin_append_audit_event(p_actor, 'admin.second_factor.enrolment_started', p_actor, NULL,
    pg_catalog.jsonb_build_object('keyId', p_key_id, 'replaced', v_replaced));
  RETURN v_replaced;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_totp_confirm_enrolment(p_actor uuid, p_session_id uuid, p_step bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_row public.admin_totp_credentials%ROWTYPE;
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL OR p_step IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid second factor confirmation';
  END IF;
  IF NOT public.admin_totp_is_admin(p_actor) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;
  IF NOT public.admin_totp_live_session(p_actor, p_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a live session for this actor is required';
  END IF;
  IF NOT public.auth_session_has_recent_reauthentication(p_session_id, 900) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'recent reauthentication required';
  END IF;

  SELECT c.* INTO v_row FROM public.admin_totp_credentials AS c WHERE c.user_id = p_actor FOR UPDATE;
  IF NOT FOUND OR v_row.confirmed_at IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'no second factor enrolment is in progress';
  END IF;
  IF v_row.locked_until IS NOT NULL AND v_row.locked_until > pg_catalog.clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'second factor is locked';
  END IF;
  IF abs(p_step - public.admin_totp_current_step()) > 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'authentication code is out of date';
  END IF;

  UPDATE public.admin_totp_credentials AS c
  SET confirmed_at = pg_catalog.clock_timestamp(), last_step = p_step, failed_attempts = 0, locked_until = NULL
  WHERE c.user_id = p_actor;

  PERFORM public.admin_append_audit_event(p_actor, 'admin.second_factor.confirmed', p_actor, NULL,
    pg_catalog.jsonb_build_object('keyId', v_row.key_id));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_totp_sealed_secret(p_actor uuid)
RETURNS TABLE(secret_ciphertext text, key_id text, confirmed boolean, locked_until timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;
  IF NOT public.admin_totp_is_admin(p_actor) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;
  RETURN QUERY
  SELECT c.secret_ciphertext, c.key_id, c.confirmed_at IS NOT NULL, c.locked_until
  FROM public.admin_totp_credentials AS c WHERE c.user_id = p_actor;
END;
$$;

-- Spending a code: 23505 for a step already used, 55000 while locked or not enrolled, 22023 for a
-- step that is not plausibly now or an unknown scope.
CREATE OR REPLACE FUNCTION public.admin_totp_verify(p_actor uuid, p_session_id uuid, p_scope text, p_step bigint)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_row public.admin_totp_credentials%ROWTYPE;
  v_expires timestamptz := pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => 300);
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL OR p_step IS NULL OR p_scope IS NULL
     OR p_scope NOT IN ('totp.manage', 'role.manage', 'economy.treasury', 'member.lifecycle',
                        'security.settings', 'backup.restore') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid second factor verification';
  END IF;
  IF NOT public.admin_totp_is_admin(p_actor) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;
  IF NOT public.admin_totp_live_session(p_actor, p_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a live session for this actor is required';
  END IF;

  SELECT c.* INTO v_row FROM public.admin_totp_credentials AS c WHERE c.user_id = p_actor FOR UPDATE;
  IF NOT FOUND OR v_row.confirmed_at IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'no confirmed second factor is enrolled';
  END IF;
  IF v_row.locked_until IS NOT NULL AND v_row.locked_until > pg_catalog.clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'second factor is locked';
  END IF;
  IF abs(p_step - public.admin_totp_current_step()) > 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'authentication code is out of date';
  END IF;
  IF v_row.last_step IS NOT NULL AND p_step <= v_row.last_step THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'authentication code was already used';
  END IF;

  UPDATE public.admin_totp_credentials AS c
  SET last_step = p_step, failed_attempts = 0, locked_until = NULL
  WHERE c.user_id = p_actor;
  INSERT INTO public.admin_totp_proofs (user_id, session_id, scope, step, expires_at)
  VALUES (p_actor, p_session_id, p_scope, p_step, v_expires);
  -- Expired proofs carry no meaning; keep the table small.
  DELETE FROM public.admin_totp_proofs AS p WHERE p.user_id = p_actor AND p.expires_at <= pg_catalog.clock_timestamp();

  PERFORM public.admin_append_audit_event(p_actor, 'admin.second_factor.verified', p_actor, NULL,
    pg_catalog.jsonb_build_object('scope', p_scope, 'step', p_step));
  RETURN v_expires;
END;
$$;

-- A wrong code. Five consecutive failures lock the factor for fifteen minutes; twenty failures in
-- fifteen minutes from one session refuse further attempts from that session.
CREATE OR REPLACE FUNCTION public.admin_totp_record_failure(p_actor uuid, p_session_id uuid)
RETURNS TABLE(failed_attempts integer, locked_until timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_attempts integer;
  v_locked timestamptz;
  v_recent integer;
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor and session are required';
  END IF;
  IF NOT public.admin_totp_live_session(p_actor, p_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a live session for this actor is required';
  END IF;
  SELECT count(*) INTO v_recent FROM public.admin_totp_attempts AS a
  WHERE a.session_id = p_session_id AND a.attempted_at > v_now - pg_catalog.make_interval(mins => 15);
  IF v_recent >= 20 THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'too many second factor attempts from this session';
  END IF;
  INSERT INTO public.admin_totp_attempts (session_id, attempted_at) VALUES (p_session_id, v_now);

  UPDATE public.admin_totp_credentials AS c
  SET failed_attempts = c.failed_attempts + 1,
      locked_until = CASE WHEN c.failed_attempts + 1 >= 5
                          THEN v_now + pg_catalog.make_interval(mins => 15) ELSE c.locked_until END
  WHERE c.user_id = p_actor
  RETURNING c.failed_attempts, c.locked_until INTO v_attempts, v_locked;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, NULL::timestamptz;
    RETURN;
  END IF;

  PERFORM public.admin_append_audit_event(p_actor, 'admin.second_factor.failed', p_actor, NULL,
    pg_catalog.jsonb_build_object('failedAttempts', v_attempts, 'lockedUntil', v_locked));
  RETURN QUERY SELECT v_attempts, v_locked;
END;
$$;

-- Removing a factor: oneself with a current totp.manage proof, or a superadmin for another
-- administrator (with recent step-up, and a security.settings proof when the caller is enrolled).
CREATE OR REPLACE FUNCTION public.admin_totp_revoke(p_actor uuid, p_session_id uuid, p_target uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_found boolean;
  v_caller_enrolled boolean;
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid second factor revocation';
  END IF;
  IF NOT public.admin_totp_is_admin(p_actor) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;
  IF NOT public.admin_totp_live_session(p_actor, p_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a live session for this actor is required';
  END IF;
  IF NOT public.auth_session_has_recent_reauthentication(p_session_id, 900) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'recent reauthentication required';
  END IF;

  IF p_target = p_actor THEN
    IF NOT public.admin_totp_proof_valid(p_actor, p_session_id, 'totp.manage') THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current second factor proof required';
    END IF;
  ELSE
    PERFORM public.admin_require_superadmin(p_actor);
    SELECT EXISTS (SELECT 1 FROM public.admin_totp_credentials AS c
                   WHERE c.user_id = p_actor AND c.confirmed_at IS NOT NULL) INTO v_caller_enrolled;
    IF v_caller_enrolled AND NOT public.admin_totp_proof_valid(p_actor, p_session_id, 'security.settings') THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current second factor proof required';
    END IF;
  END IF;

  DELETE FROM public.admin_totp_proofs AS p WHERE p.user_id = p_target;
  DELETE FROM public.admin_totp_credentials AS c WHERE c.user_id = p_target;
  v_found := FOUND;
  IF v_found THEN
    PERFORM public.admin_append_audit_event(p_actor, 'admin.second_factor.revoked', p_target, NULL,
      pg_catalog.jsonb_build_object('targetUserId', p_target));
  END IF;
  RETURN v_found;
END;
$$;

DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.admin_totp_live_session(uuid, uuid)',
    'public.admin_totp_current_step()',
    'public.admin_totp_is_admin(uuid)',
    'public.admin_totp_proof_valid(uuid, uuid, text)',
    'public.admin_totp_requirement(uuid)',
    'public.admin_totp_begin_enrolment(uuid, uuid, text, text)',
    'public.admin_totp_confirm_enrolment(uuid, uuid, bigint)',
    'public.admin_totp_sealed_secret(uuid)',
    'public.admin_totp_verify(uuid, uuid, text, bigint)',
    'public.admin_totp_record_failure(uuid, uuid)',
    'public.admin_totp_revoke(uuid, uuid, uuid)'
  ] LOOP
    EXECUTE 'ALTER FUNCTION ' || f || ' OWNER TO moneyverse_migrator';
    EXECUTE 'REVOKE ALL PRIVILEGES ON FUNCTION ' || f || ' FROM PUBLIC, moneyverse_app';
  END LOOP;
END $$;

-- Helpers (live_session, current_step, is_admin) stay ungranted.
GRANT EXECUTE ON FUNCTION public.admin_totp_proof_valid(uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_requirement(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_begin_enrolment(uuid, uuid, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_confirm_enrolment(uuid, uuid, bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_sealed_secret(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_verify(uuid, uuid, text, bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_record_failure(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_revoke(uuid, uuid, uuid) TO moneyverse_app;

COMMIT;
