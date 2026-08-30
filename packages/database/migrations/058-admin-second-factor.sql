-- The second authentication factor, and the device and address policy around
-- an administrator login.
--
-- WHY THIS IS IN THE SAME STACK AS 057 AND 058. Two-person approval was the
-- only compensating control over money, treasury and account actions, and 058
-- removed it and put every one of those powers in a single account. Sign-in
-- is OAuth-only: whoever holds the Discord or Google account holds the
-- console. §10 asks for WebAuthn or TOTP; this is TOTP, and WebAuthn is
-- deliberately deferred (it needs an attestation and credential store, a
-- browser ceremony and a recovery path, none of which exists here yet).
--
-- WHY THE DATABASE NEVER HOLDS A USABLE FACTOR. §10 requires that reading the
-- database is not enough to produce a valid code. So the shared secret
-- arrives already sealed by the application with a key that lives only in the
-- deployment's environment, and this schema stores the ciphertext. Verifying
-- a code therefore happens in the application, which is the only place the
-- key exists.
--
-- The alternative -- computing HMAC-SHA1 here with `public.hmac`, which
-- pgcrypto provides and a definer owned by moneyverse_migrator could call --
-- was rejected precisely because it works: it would put the secret and the
-- verifier in the same database, so one dump would yield working codes
-- forever. What this schema keeps instead is everything the application must
-- not be trusted to decide on its own: whether a credential is confirmed,
-- whether the step being claimed is plausibly the current one, whether that
-- step has already been spent, and how many failures have accumulated.
--
-- No BEGIN/COMMIT, for the reason given in 057 and 058.

CREATE TABLE IF NOT EXISTS public.admin_totp_credentials (
  user_id uuid PRIMARY KEY REFERENCES public.users(id),
  -- Base64 of nonce || tag || ciphertext, sealed by the application.
  secret_ciphertext text NOT NULL CHECK (pg_catalog.char_length(secret_ciphertext) BETWEEN 32 AND 512),
  -- Which environment key sealed it, so a key can be rotated without
  -- guessing which rows the new key can still open.
  key_id text NOT NULL CHECK (key_id ~ '^[a-z0-9][a-z0-9_.:-]{0,63}$'),
  digits smallint NOT NULL DEFAULT 6 CHECK (digits IN (6, 8)),
  period_seconds integer NOT NULL DEFAULT 30 CHECK (period_seconds IN (30, 60)),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  confirmed_at timestamptz,
  -- The last time step spent. Monotonic, so a code observed on the wire
  -- cannot be replayed inside its own window.
  last_step bigint,
  last_verified_at timestamptz,
  failed_attempts integer NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  locked_until timestamptz
);

REVOKE ALL PRIVILEGES ON TABLE public.admin_totp_credentials FROM PUBLIC, moneyverse_app;

-- A device is remembered by a hash the application computes from properties
-- of the browser plus a per-deployment pepper. The raw properties are not
-- stored: they identify a person's machine, and §14.9 limits what may be
-- recorded to what the purpose needs.
CREATE TABLE IF NOT EXISTS public.admin_trusted_devices (
  user_id uuid NOT NULL REFERENCES public.users(id),
  device_hash text NOT NULL CHECK (device_hash ~ '^[0-9a-f]{64}$'),
  label text NOT NULL DEFAULT '' CHECK (pg_catalog.char_length(label) <= 100),
  first_seen_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  last_seen_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  PRIMARY KEY (user_id, device_hash)
);

REVOKE ALL PRIVILEGES ON TABLE public.admin_trusted_devices FROM PUBLIC, moneyverse_app;

CREATE TABLE IF NOT EXISTS public.admin_ip_allowlist (
  user_id uuid NOT NULL REFERENCES public.users(id),
  network cidr NOT NULL,
  label text NOT NULL DEFAULT '' CHECK (pg_catalog.char_length(label) <= 100),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  PRIMARY KEY (user_id, network)
);

REVOKE ALL PRIVILEGES ON TABLE public.admin_ip_allowlist FROM PUBLIC, moneyverse_app;

-- Every evaluation, allowed or not. This is what an alert on "administrator
-- login from an unknown address" reads (§14.9 로그 검색·보존·경보); the
-- scheduler that raises the alert is PR7's.
-- `user_id` deliberately carries no foreign key, unlike every other table in
-- this migration. This is a security log about a claimed identity, and the
-- claim is worth recording whether or not the account behind it still exists
-- -- a deleted or never-existing subject is exactly the case an alert wants
-- to see, and a constraint that refused the row would leave the gap where it
-- matters most.
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  user_id uuid NOT NULL,
  ip_address inet,
  device_hash text,
  decision text NOT NULL CHECK (decision IN ('allow', 'challenge', 'block')),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS admin_login_attempts_recent
  ON public.admin_login_attempts (created_at DESC, id DESC);

REVOKE ALL PRIVILEGES ON TABLE public.admin_login_attempts FROM PUBLIC, moneyverse_app;

-- Enrolment, step one: store a freshly sealed secret, unconfirmed.
--
-- It takes the session as well as the actor because enrolling a new secret
-- replaces the factor, which is the same act as removing it. A live session
-- is not enough; the caller must have proved control of an OAuth identity in
-- the last five minutes.
CREATE OR REPLACE FUNCTION public.admin_totp_begin_enrolment(
  p_actor uuid,
  p_session_id uuid,
  p_secret_ciphertext text,
  p_key_id text,
  p_digits smallint DEFAULT 6,
  p_period_seconds integer DEFAULT 30
)
RETURNS TABLE(replaced_confirmed_credential boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_replaced boolean := false;
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL
    OR p_secret_ciphertext IS NULL OR p_key_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid second factor enrolment';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.auth_sessions AS session_row
    WHERE session_row.id = p_session_id AND session_row.user_id = p_actor
      AND session_row.revoked_at IS NULL
      AND session_row.expires_at > pg_catalog.clock_timestamp()
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a live session for this actor is required';
  END IF;

  IF NOT public.auth_session_has_recent_reauthentication(p_session_id, 300) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'recent reauthentication required';
  END IF;

  SELECT credential_row.confirmed_at IS NOT NULL INTO v_replaced
  FROM public.admin_totp_credentials AS credential_row
  WHERE credential_row.user_id = p_actor
  FOR UPDATE;

  INSERT INTO public.admin_totp_credentials (
    user_id, secret_ciphertext, key_id, digits, period_seconds,
    confirmed_at, last_step, last_verified_at, failed_attempts, locked_until
  ) VALUES (
    p_actor, p_secret_ciphertext, p_key_id, p_digits, p_period_seconds,
    NULL, NULL, NULL, 0, NULL
  )
  ON CONFLICT (user_id) DO UPDATE
  SET secret_ciphertext = EXCLUDED.secret_ciphertext,
      key_id = EXCLUDED.key_id,
      digits = EXCLUDED.digits,
      period_seconds = EXCLUDED.period_seconds,
      created_at = pg_catalog.clock_timestamp(),
      confirmed_at = NULL,
      last_step = NULL,
      last_verified_at = NULL,
      failed_attempts = 0,
      locked_until = NULL;

  PERFORM public.admin_append_audit_event(
    p_actor, 'admin.second_factor.enrolment_started', p_actor, NULL,
    pg_catalog.jsonb_build_object(
      'keyId', p_key_id,
      'replacedConfirmedCredential', coalesce(v_replaced, false)
    )
  );

  RETURN QUERY SELECT coalesce(v_replaced, false);
END;
$$;

-- Enrolment, step two: the application has verified one code against the
-- secret it just sealed, and says which time step it was.
--
-- The step is checked against this server's clock, not taken on trust. The
-- application holds the key and therefore decides whether a code matches, but
-- it does not get to decide *when* -- a claim of a step far from now is
-- either a broken clock or a caller trying to burn a future window.
CREATE OR REPLACE FUNCTION public.admin_totp_confirm_enrolment(
  p_actor uuid,
  p_session_id uuid,
  p_step bigint
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_credential public.admin_totp_credentials%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_current_step bigint;
BEGIN
  IF p_actor IS NULL OR p_session_id IS NULL OR p_step IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid second factor confirmation';
  END IF;

  IF NOT public.auth_session_has_recent_reauthentication(p_session_id, 300) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'recent reauthentication required';
  END IF;

  SELECT credential_row.* INTO v_credential
  FROM public.admin_totp_credentials AS credential_row
  WHERE credential_row.user_id = p_actor
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'no second factor enrolment is in progress';
  END IF;

  v_current_step := pg_catalog.floor(
    extract(epoch FROM v_now) / v_credential.period_seconds
  )::bigint;
  IF abs(p_step - v_current_step) > 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'authentication code is out of date';
  END IF;

  UPDATE public.admin_totp_credentials AS credential_row
  SET confirmed_at = v_now,
      last_step = p_step,
      last_verified_at = v_now,
      failed_attempts = 0,
      locked_until = NULL
  WHERE credential_row.user_id = p_actor;

  PERFORM public.admin_append_audit_event(
    p_actor, 'admin.second_factor.confirmed', p_actor, NULL,
    pg_catalog.jsonb_build_object('keyId', v_credential.key_id)
  );

  RETURN true;
END;
$$;

-- What the application needs to verify a code: the sealed secret and the
-- parameters it was sealed with. It never returns anything for an
-- unconfirmed credential except during enrolment, which supplies its own
-- ciphertext, so a caller cannot walk this into a factor it has not set up.
CREATE OR REPLACE FUNCTION public.admin_totp_sealed_secret(p_actor uuid)
RETURNS TABLE(
  secret_ciphertext text,
  key_id text,
  digits smallint,
  period_seconds integer,
  confirmed boolean,
  locked_until timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  RETURN QUERY
  SELECT credential_row.secret_ciphertext,
         credential_row.key_id,
         credential_row.digits,
         credential_row.period_seconds,
         credential_row.confirmed_at IS NOT NULL,
         credential_row.locked_until
  FROM public.admin_totp_credentials AS credential_row
  WHERE credential_row.user_id = p_actor;
END;
$$;

-- Spending a code.
--
-- 23505 for a step already used, matching the codebase's "already done"
-- vocabulary; 55000 while the credential is locked, matching "switched off";
-- 22023 for a step that is not plausibly now.
CREATE OR REPLACE FUNCTION public.admin_totp_consume(
  p_actor uuid,
  p_step bigint
)
RETURNS TABLE(verified_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_credential public.admin_totp_credentials%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_current_step bigint;
BEGIN
  IF p_actor IS NULL OR p_step IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid second factor verification';
  END IF;

  SELECT credential_row.* INTO v_credential
  FROM public.admin_totp_credentials AS credential_row
  WHERE credential_row.user_id = p_actor
  FOR UPDATE;

  IF NOT FOUND OR v_credential.confirmed_at IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'no confirmed second factor is enrolled';
  END IF;

  IF v_credential.locked_until IS NOT NULL AND v_credential.locked_until > v_now THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'second factor is locked';
  END IF;

  v_current_step := pg_catalog.floor(
    extract(epoch FROM v_now) / v_credential.period_seconds
  )::bigint;
  IF abs(p_step - v_current_step) > 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'authentication code is out of date';
  END IF;

  IF v_credential.last_step IS NOT NULL AND p_step <= v_credential.last_step THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'authentication code was already used';
  END IF;

  UPDATE public.admin_totp_credentials AS credential_row
  SET last_step = p_step,
      last_verified_at = v_now,
      failed_attempts = 0,
      locked_until = NULL
  WHERE credential_row.user_id = p_actor;

  PERFORM public.admin_append_audit_event(
    p_actor, 'admin.second_factor.verified', p_actor, NULL,
    pg_catalog.jsonb_build_object('step', p_step)
  );

  RETURN QUERY SELECT v_now;
END;
$$;

-- A wrong code. Five in a row lock the factor for fifteen minutes, which is
-- what makes a six-digit code worth having: brute force is a rate problem,
-- not an entropy problem.
CREATE OR REPLACE FUNCTION public.admin_totp_record_failure(p_actor uuid)
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
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  UPDATE public.admin_totp_credentials AS credential_row
  SET failed_attempts = credential_row.failed_attempts + 1,
      locked_until = CASE
        WHEN credential_row.failed_attempts + 1 >= 5
        THEN v_now + pg_catalog.make_interval(mins => 15)
        ELSE credential_row.locked_until
      END
  WHERE credential_row.user_id = p_actor
  RETURNING credential_row.failed_attempts, credential_row.locked_until
  INTO v_attempts, v_locked;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, NULL::timestamptz;
    RETURN;
  END IF;

  PERFORM public.admin_append_audit_event(
    p_actor, 'admin.second_factor.failed', p_actor, NULL,
    pg_catalog.jsonb_build_object('failedAttempts', v_attempts, 'lockedUntil', v_locked)
  );

  RETURN QUERY SELECT v_attempts, v_locked;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_second_factor_satisfied(
  p_actor uuid,
  p_max_age_seconds integer DEFAULT 300
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_totp_credentials AS credential_row
    WHERE credential_row.user_id = p_actor
      AND credential_row.confirmed_at IS NOT NULL
      AND (credential_row.locked_until IS NULL
           OR credential_row.locked_until <= pg_catalog.clock_timestamp())
      AND credential_row.last_verified_at >= pg_catalog.clock_timestamp()
          - pg_catalog.make_interval(secs => greatest(60, least(p_max_age_seconds, 3600)))
  )
$$;

-- Where the login is coming from.
--
-- 'block' when an allowlist exists and the address is outside it; 'challenge'
-- otherwise, because the console always wants the second factor. There is no
-- 'allow' without a challenge for an unknown device, and 'allow' at all only
-- means "this address and this device are both already known", which the
-- surface uses to skip nothing today and PR7's alerting uses to tell a
-- routine sign-in from a notable one.
CREATE OR REPLACE FUNCTION public.admin_evaluate_login_context(
  p_actor uuid,
  p_ip_address inet,
  p_device_hash text
)
RETURNS TABLE(decision text, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_decision text;
  v_reason text;
  v_has_allowlist boolean;
  v_address_allowed boolean := false;
  v_device_known boolean := false;
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.admin_ip_allowlist AS allow_row WHERE allow_row.user_id = p_actor
  ) INTO v_has_allowlist;

  IF v_has_allowlist AND p_ip_address IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.admin_ip_allowlist AS allow_row
      WHERE allow_row.user_id = p_actor AND p_ip_address <<= allow_row.network
    ) INTO v_address_allowed;
  END IF;

  IF p_device_hash IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.admin_trusted_devices AS device_row
      WHERE device_row.user_id = p_actor AND device_row.device_hash = p_device_hash
    ) INTO v_device_known;
  END IF;

  IF v_has_allowlist AND NOT v_address_allowed THEN
    v_decision := 'block';
    v_reason := 'address outside the administrator allowlist';
  ELSIF NOT v_device_known THEN
    v_decision := 'challenge';
    v_reason := 'unrecognised device';
  ELSE
    v_decision := 'challenge';
    v_reason := 'second factor required';
  END IF;

  INSERT INTO public.admin_login_attempts (user_id, ip_address, device_hash, decision, reason)
  VALUES (p_actor, p_ip_address, p_device_hash, v_decision, v_reason);

  IF v_decision = 'block' THEN
    PERFORM public.admin_append_audit_event(
      p_actor, 'admin.login.blocked', p_actor, NULL,
      pg_catalog.jsonb_build_object('reason', v_reason)
    );
  END IF;

  RETURN QUERY SELECT v_decision, v_reason;
END;
$$;

-- A device becomes known only after a code from it was accepted.
CREATE OR REPLACE FUNCTION public.admin_trust_device(
  p_actor uuid,
  p_device_hash text,
  p_label text DEFAULT ''
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_device_hash IS NULL OR p_device_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid device registration';
  END IF;

  IF NOT public.admin_second_factor_satisfied(p_actor, 300) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'recent second factor required';
  END IF;

  INSERT INTO public.admin_trusted_devices (user_id, device_hash, label)
  VALUES (p_actor, p_device_hash, pg_catalog.left(coalesce(p_label, ''), 100))
  ON CONFLICT (user_id, device_hash) DO UPDATE
  SET last_seen_at = pg_catalog.clock_timestamp();

  RETURN true;
END;
$$;

-- The allowlist is replaced whole rather than edited entry by entry: a
-- partial edit that leaves an operator outside their own allowlist locks them
-- out of the console with no way back in, and reviewing one list before
-- saving it is the only version of this operation that can be checked.
CREATE OR REPLACE FUNCTION public.admin_set_ip_allowlist(
  p_key uuid,
  p_actor uuid,
  p_target uuid,
  p_networks text[],
  p_reason text
)
RETURNS TABLE(entries integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text;
  v_existing public.admin_command_receipts%ROWTYPE;
  v_entries integer := 0;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_target IS NULL OR p_networks IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid allowlist request';
  END IF;
  IF pg_catalog.array_length(p_networks, 1) > 50 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'at most 50 networks are allowed';
  END IF;
  v_reason := public.admin_normalized_reason(p_reason);

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_set_ip_allowlist:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT (v_existing.result ->> 'entries')::integer;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  DELETE FROM public.admin_ip_allowlist AS allow_row WHERE allow_row.user_id = p_target;

  INSERT INTO public.admin_ip_allowlist (user_id, network)
  SELECT p_target, network_text::cidr
  FROM pg_catalog.unnest(p_networks) AS network_text
  ON CONFLICT (user_id, network) DO NOTHING;
  GET DIAGNOSTICS v_entries = ROW_COUNT;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'admin.login_policy.allowlist_set', p_target, v_reason,
    pg_catalog.jsonb_build_object('entries', v_entries)
  );

  PERFORM public.admin_append_audit_event(
    p_actor, 'admin.login_policy.allowlist_set', p_target, p_key,
    pg_catalog.jsonb_build_object('reason', v_reason, 'entries', v_entries)
  );

  RETURN QUERY SELECT v_entries;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_login_policy(p_actor uuid, p_target uuid)
RETURNS TABLE(
  kind text,
  value text,
  label text,
  recorded_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  -- An administrator may always read their own policy; reading somebody
  -- else's is a superadmin act.
  IF p_actor IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor and target are required';
  END IF;
  IF p_actor <> p_target THEN
    PERFORM public.admin_require_superadmin(p_actor);
  ELSIF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  RETURN QUERY
  SELECT 'network'::text, allow_row.network::text, allow_row.label, allow_row.created_at
  FROM public.admin_ip_allowlist AS allow_row
  WHERE allow_row.user_id = p_target
  UNION ALL
  SELECT 'device'::text, device_row.device_hash, device_row.label, device_row.last_seen_at
  FROM public.admin_trusted_devices AS device_row
  WHERE device_row.user_id = p_target
  ORDER BY 1, 4 DESC;
END;
$$;

-- 058 opened the console on a recent reauthentication alone, because the
-- table this checks did not exist yet. It does now, and the whole point of
-- this migration is that one factor is not enough for an account that holds
-- every power in the system.
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

  IF NOT public.auth_session_has_recent_reauthentication(p_session_id, 300) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'recent reauthentication required';
  END IF;

  IF NOT public.admin_second_factor_satisfied(p_actor, 300) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'recent second factor required';
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
    pg_catalog.jsonb_build_object('rotatedFrom', p_session_id::text)
  );

  RETURN QUERY SELECT v_new,
                      v_now + pg_catalog.make_interval(mins => 30),
                      v_now + pg_catalog.make_interval(mins => 10);
END;
$$;

ALTER FUNCTION public.admin_totp_begin_enrolment(uuid, uuid, text, text, smallint, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_totp_confirm_enrolment(uuid, uuid, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_totp_sealed_secret(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_totp_consume(uuid, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_totp_record_failure(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_second_factor_satisfied(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_evaluate_login_context(uuid, inet, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_trust_device(uuid, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_set_ip_allowlist(uuid, uuid, uuid, text[], text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_login_policy(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_session_open(uuid, uuid, text, text) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_totp_begin_enrolment(uuid, uuid, text, text, smallint, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_totp_confirm_enrolment(uuid, uuid, bigint) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_totp_sealed_secret(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_totp_consume(uuid, bigint) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_totp_record_failure(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_second_factor_satisfied(uuid, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_evaluate_login_context(uuid, inet, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_trust_device(uuid, text, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_set_ip_allowlist(uuid, uuid, uuid, text[], text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_login_policy(uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_session_open(uuid, uuid, text, text) FROM PUBLIC, moneyverse_app;

-- `admin_second_factor_satisfied` is granted for the same reason
-- `auth_session_has_recent_reauthentication` (031) is: a guard has to be able
-- to ask "was this proved recently" before letting a request through, and a
-- question the guard cannot ask is a guard that admits everybody. It reads
-- one boolean and reveals nothing a caller could not learn by trying.
GRANT EXECUTE ON FUNCTION public.admin_second_factor_satisfied(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_begin_enrolment(uuid, uuid, text, text, smallint, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_confirm_enrolment(uuid, uuid, bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_sealed_secret(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_consume(uuid, bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_totp_record_failure(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_evaluate_login_context(uuid, inet, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_trust_device(uuid, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_set_ip_allowlist(uuid, uuid, uuid, text[], text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_login_policy(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_session_open(uuid, uuid, text, text) TO moneyverse_app;
