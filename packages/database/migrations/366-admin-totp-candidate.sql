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
-- attempts have accumulated, which credential version the code was checked against, and whether
-- a proof exists for this session and scope. Computing the HMAC here with pgcrypto was rejected
-- for the reason 058 rejected it: one dump would then yield working codes.
--
-- KNOWN LIMIT (recorded, not solved here). moneyverse_app calls verify with a step it claims to
-- have matched, so the holder of the application's database credential can mint a proof without
-- a code. That credential can already insert auth_sessions rows and set reauthenticated_at, i.e.
-- it can already forge an administrator session and step-up; the factor does not widen that
-- exposure. Closing it needs a separate verifier LOGIN principal, which is an owner provisioning
-- step outside this migration.
--
-- REPLACEMENT. A new secret is stored as *pending* beside the active one. The active credential
-- keeps verifying and enforcement stays on until the pending one is confirmed, which swaps it in
-- atomically and ends every proof made with the old factor. Each credential carries a version id;
-- confirmation and verification name the version the application checked, so a code matched
-- against one secret can never confirm or verify a different one that replaced it concurrently.
--
-- ENFORCEMENT. Seeded switch 'admin_totp_required' is 'disabled', so merging this changes nothing
-- for an administrator who has not enrolled. An enrolled administrator is enforced regardless of
-- the switch; turning the switch on (an owner rollout decision) enforces every administrator.
-- Rollout order: this migration before the application that calls it, or the boundary's
-- fail-closed lookup refuses scoped writes.

BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_totp_credentials (
  user_id uuid PRIMARY KEY REFERENCES public.users(id),
  -- Active credential: base64 of nonce || ciphertext || tag, sealed with AAD userId|keyId.
  secret_ciphertext text CHECK (secret_ciphertext IS NULL OR pg_catalog.char_length(secret_ciphertext) BETWEEN 32 AND 512),
  key_id text CHECK (key_id IS NULL OR key_id ~ '^[a-z0-9][a-z0-9_.:-]{0,63}$'),
  credential_version uuid,
  confirmed_at timestamptz,
  -- Pending credential awaiting its first code.
  pending_ciphertext text CHECK (pending_ciphertext IS NULL OR pg_catalog.char_length(pending_ciphertext) BETWEEN 32 AND 512),
  pending_key_id text CHECK (pending_key_id IS NULL OR pending_key_id ~ '^[a-z0-9][a-z0-9_.:-]{0,63}$'),
  pending_version uuid,
  pending_created_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  -- Monotonic for the active credential: a step at or below this one is a replay.
  last_step bigint,
  failed_attempts integer NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  locked_until timestamptz,
  CHECK ((secret_ciphertext IS NULL) = (credential_version IS NULL) AND (secret_ciphertext IS NULL) = (confirmed_at IS NULL)),
  CHECK ((pending_ciphertext IS NULL) = (pending_version IS NULL))
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

-- Failed-attempt ceiling per session: after twenty failures in fifteen minutes the session may not
-- attempt again, correct code or not. The lock is taken before the count so concurrent attempts
-- cannot both observe nineteen. Successes are deliberately not counted: whoever presents a correct
-- code already holds the factor, and counting them would only throttle a legitimate administrator.
CREATE OR REPLACE FUNCTION public.admin_totp_session_gate(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_recent integer;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_totp_attempt:' || p_session_id::text, 0));
  SELECT count(*) INTO v_recent FROM public.admin_totp_attempts AS a
  WHERE a.session_id = p_session_id
    AND a.attempted_at > pg_catalog.clock_timestamp() - pg_catalog.make_interval(mins => 15);
  IF v_recent >= 20 THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'too many second factor attempts from this session';
  END IF;
END;
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
  v_replacing boolean := false;
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

  SELECT c.confirmed_at IS NOT NULL INTO v_replacing
  FROM public.admin_totp_credentials AS c WHERE c.user_id = p_actor FOR UPDATE;
  v_replacing := coalesce(v_replacing, false);

  -- A stolen session plus password must not be able to stage the thief's own factor.
  IF v_replacing AND NOT public.admin_totp_proof_valid(p_actor, p_session_id, 'totp.manage') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current second factor proof required';
  END IF;

  -- Only the pending slot changes; the active credential, its proofs and enforcement stay.
  INSERT INTO public.admin_totp_credentials AS c (user_id, pending_ciphertext, pending_key_id, pending_version, pending_created_at)
  VALUES (p_actor, p_secret_ciphertext, p_key_id, gen_random_uuid(), pg_catalog.clock_timestamp())
  ON CONFLICT (user_id) DO UPDATE
  SET pending_ciphertext = EXCLUDED.pending_ciphertext,
      pending_key_id = EXCLUDED.pending_key_id,
      pending_version = EXCLUDED.pending_version,
      pending_created_at = EXCLUDED.pending_created_at;

  PERFORM public.admin_append_audit_event(p_actor, 'admin.second_factor.enrolment_started', p_actor, NULL,
    pg_catalog.jsonb_build_object('keyId', p_key_id, 'replacing', v_replacing));
  RETURN v_replacing;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_totp_confirm_enrolment(p_actor uuid, p_session_id uuid, p_step bigint, p_version uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_row public.admin_totp_credentials%ROWTYPE;
  v_replacing boolean;
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL OR p_step IS NULL OR p_version IS NULL THEN
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
  PERFORM public.admin_totp_session_gate(p_session_id);

  SELECT c.* INTO v_row FROM public.admin_totp_credentials AS c WHERE c.user_id = p_actor FOR UPDATE;
  IF NOT FOUND OR v_row.pending_version IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'no second factor enrolment is in progress';
  END IF;
  IF v_row.pending_version <> p_version THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'second factor credential changed';
  END IF;
  IF v_row.locked_until IS NOT NULL AND v_row.locked_until > pg_catalog.clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'second factor is locked';
  END IF;
  IF abs(p_step - public.admin_totp_current_step()) > 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'authentication code is out of date';
  END IF;
  v_replacing := v_row.confirmed_at IS NOT NULL;

  UPDATE public.admin_totp_credentials AS c
  SET secret_ciphertext = c.pending_ciphertext, key_id = c.pending_key_id,
      credential_version = c.pending_version, confirmed_at = pg_catalog.clock_timestamp(),
      pending_ciphertext = NULL, pending_key_id = NULL, pending_version = NULL, pending_created_at = NULL,
      last_step = p_step, failed_attempts = 0, locked_until = NULL
  WHERE c.user_id = p_actor;
  -- Proofs made with the old factor end with it.
  DELETE FROM public.admin_totp_proofs AS p WHERE p.user_id = p_actor;

  PERFORM public.admin_append_audit_event(p_actor, 'admin.second_factor.confirmed', p_actor, NULL,
    pg_catalog.jsonb_build_object('keyId', v_row.pending_key_id, 'replacing', v_replacing));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_totp_sealed_secret(p_actor uuid)
RETURNS TABLE(secret_ciphertext text, key_id text, credential_version uuid, confirmed boolean, locked_until timestamptz,
              pending_ciphertext text, pending_key_id text, pending_version uuid)
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
  SELECT c.secret_ciphertext, c.key_id, c.credential_version, c.confirmed_at IS NOT NULL, c.locked_until,
         c.pending_ciphertext, c.pending_key_id, c.pending_version
  FROM public.admin_totp_credentials AS c WHERE c.user_id = p_actor;
END;
$$;

-- Spending a code: 23505 for a step already used, 55000 while locked, not enrolled or over the
-- session ceiling, 22023 for a step that is not plausibly now, an unknown scope or a credential
-- version that is no longer the active one.
CREATE OR REPLACE FUNCTION public.admin_totp_verify(p_actor uuid, p_session_id uuid, p_scope text, p_step bigint, p_version uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_row public.admin_totp_credentials%ROWTYPE;
  v_expires timestamptz := pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => 300);
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL OR p_step IS NULL OR p_version IS NULL OR p_scope IS NULL
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
  PERFORM public.admin_totp_session_gate(p_session_id);

  SELECT c.* INTO v_row FROM public.admin_totp_credentials AS c WHERE c.user_id = p_actor FOR UPDATE;
  IF NOT FOUND OR v_row.confirmed_at IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'no confirmed second factor is enrolled';
  END IF;
  IF v_row.credential_version <> p_version THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'second factor credential changed';
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
-- fifteen minutes from one session refuse further attempts from that session (session gate).
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
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor and session are required';
  END IF;
  IF NOT public.admin_totp_live_session(p_actor, p_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a live session for this actor is required';
  END IF;
  PERFORM public.admin_totp_session_gate(p_session_id);
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
-- administrator with recent step-up and, whenever the caller is enforced (enrolled, or every
-- administrator once the switch is on), the caller's own security.settings proof. An enforced
-- caller with no factor cannot revoke anyone; recovery then is another enrolled superadmin, or
-- the owner turning the switch off, or the documented operator procedure.
CREATE OR REPLACE FUNCTION public.admin_totp_revoke(p_actor uuid, p_session_id uuid, p_target uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_found boolean;
  v_caller_enforced boolean;
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
    SELECT r.enforced INTO v_caller_enforced FROM public.admin_totp_requirement(p_actor) AS r;
    IF v_caller_enforced AND NOT public.admin_totp_proof_valid(p_actor, p_session_id, 'security.settings') THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current second factor proof required';
    END IF;
  END IF;

  -- Credential row first, then proofs: the same order confirm and verify use, so a concurrent
  -- confirmation and revocation queue on the row instead of deadlocking.
  PERFORM 1 FROM public.admin_totp_credentials AS c WHERE c.user_id = p_target FOR UPDATE;
  v_found := FOUND;
  DELETE FROM public.admin_totp_proofs AS p WHERE p.user_id = p_target;
  DELETE FROM public.admin_totp_credentials AS c WHERE c.user_id = p_target;
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
    'public.admin_totp_session_gate(uuid)',
    'public.admin_totp_proof_valid(uuid, uuid, text)',
    'public.admin_totp_requirement(uuid)',
    'public.admin_totp_begin_enrolment(uuid, uuid, text, text)',
    'public.admin_totp_confirm_enrolment(uuid, uuid, bigint, uuid)',
    'public.admin_totp_sealed_secret(uuid)',
    'public.admin_totp_verify(uuid, uuid, text, bigint, uuid)',
    'public.admin_totp_record_failure(uuid, uuid)',
    'public.admin_totp_revoke(uuid, uuid, uuid)'
  ] LOOP
    EXECUTE 'ALTER FUNCTION ' || f || ' OWNER TO moneyverse_migrator';
    EXECUTE 'REVOKE ALL PRIVILEGES ON FUNCTION ' || f || ' FROM PUBLIC, moneyverse_app';
  END LOOP;
END $$;

-- Helpers (live_session, current_step, is_admin, session_gate) stay ungranted.
GRANT EXECUTE ON FUNCTION public.admin_totp_proof_valid(uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_requirement(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_begin_enrolment(uuid, uuid, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_confirm_enrolment(uuid, uuid, bigint, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_sealed_secret(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_verify(uuid, uuid, text, bigint, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_record_failure(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_revoke(uuid, uuid, uuid) TO moneyverse_app;

COMMIT;
