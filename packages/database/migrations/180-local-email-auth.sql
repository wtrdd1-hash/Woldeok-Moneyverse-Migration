-- First-party local email/password authentication.
-- The application role never gets direct table access; it can only use the
-- purpose-built SECURITY DEFINER functions below.

ALTER TYPE public.identity_provider ADD VALUE IF NOT EXISTS 'local_email';

BEGIN;

CREATE TABLE IF NOT EXISTS public.auth_local_credentials (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  email_hash text NOT NULL UNIQUE,
  password_verifier text NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now(),
  changed_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz,
  CONSTRAINT auth_local_credentials_email_hash_check CHECK (email_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT auth_local_credentials_email_length_check CHECK (char_length(email) BETWEEN 3 AND 254),
  CONSTRAINT auth_local_credentials_verifier_length_check CHECK (char_length(password_verifier) BETWEEN 64 AND 512)
);

CREATE TABLE IF NOT EXISTS public.auth_local_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_auth_session_id uuid NOT NULL REFERENCES public.auth_sessions(id) ON DELETE CASCADE,
  email text NOT NULL,
  email_hash text NOT NULL,
  password_verifier text NOT NULL,
  display_name text NOT NULL,
  verification_token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_local_registrations_email_hash_check CHECK (email_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT auth_local_registrations_token_hash_check CHECK (verification_token_hash ~ '^[0-9a-f]{64}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_local_registrations_active_email_idx
  ON public.auth_local_registrations(email_hash)
  WHERE consumed_at IS NULL;
CREATE INDEX IF NOT EXISTS auth_local_registrations_expiry_idx
  ON public.auth_local_registrations(expires_at)
  WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS public.auth_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_security_events_user_created_idx
  ON public.auth_security_events(user_id, created_at DESC);

REVOKE ALL PRIVILEGES ON TABLE
  public.auth_local_credentials,
  public.auth_local_registrations,
  public.auth_security_events
FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.auth_start_local_registration(
  p_pre_auth_session_id uuid,
  p_email text,
  p_email_hash text,
  p_password_verifier text,
  p_display_name text,
  p_verification_token_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_email IS NULL OR char_length(p_email) < 3 OR char_length(p_email) > 254
    OR p_email_hash IS NULL OR p_email_hash !~ '^[0-9a-f]{64}$'
    OR p_password_verifier IS NULL OR char_length(p_password_verifier) < 64 OR char_length(p_password_verifier) > 512
    OR p_verification_token_hash IS NULL OR p_verification_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid local registration input' USING ERRCODE = '22023';
  END IF;

  v_name := left(btrim(p_display_name), 120);
  IF char_length(v_name) < 2 THEN
    RAISE EXCEPTION 'invalid display name' USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.auth_sessions AS session_row
  WHERE session_row.id = p_pre_auth_session_id
    AND session_row.user_id IS NULL
    AND session_row.revoked_at IS NULL
    AND session_row.expires_at > pg_catalog.now()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'active pre-login session required' USING ERRCODE = '28000';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('local-email:' || p_email_hash, 0));

  IF EXISTS (
    SELECT 1 FROM public.auth_local_credentials AS credential
    WHERE credential.email_hash = p_email_hash
  ) THEN
    RETURN false;
  END IF;

  UPDATE public.auth_local_registrations
  SET consumed_at = coalesce(consumed_at, pg_catalog.now())
  WHERE email_hash = p_email_hash AND consumed_at IS NULL;

  INSERT INTO public.auth_local_registrations(
    pre_auth_session_id, email, email_hash, password_verifier,
    display_name, verification_token_hash, expires_at
  ) VALUES (
    p_pre_auth_session_id, p_email, p_email_hash, p_password_verifier,
    v_name, p_verification_token_hash, pg_catalog.now() + interval '30 minutes'
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_complete_local_registration(
  p_pre_auth_session_id uuid,
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
  v_registration public.auth_local_registrations%ROWTYPE;
  v_user_id uuid;
  v_session_id uuid;
  v_consent_version uuid;
  v_age_confirmed boolean;
BEGIN
  IF p_verification_token_hash IS NULL OR p_verification_token_hash !~ '^[0-9a-f]{64}$'
    OR p_session_token_hash IS NULL OR p_session_token_hash !~ '^[0-9a-f]{64}$'
    OR p_csrf_hash IS NULL OR p_csrf_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid credential hash' USING ERRCODE = '22023';
  END IF;

  SELECT session_row.prelogin_consent_version_id, session_row.prelogin_age_confirmed
  INTO v_consent_version, v_age_confirmed
  FROM public.auth_sessions AS session_row
  WHERE session_row.id = p_pre_auth_session_id
    AND session_row.user_id IS NULL
    AND session_row.revoked_at IS NULL
    AND session_row.expires_at > pg_catalog.now()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'active pre-login session required' USING ERRCODE = '28000';
  END IF;

  SELECT registration.* INTO v_registration
  FROM public.auth_local_registrations AS registration
  WHERE registration.pre_auth_session_id = p_pre_auth_session_id
    AND registration.verification_token_hash = p_verification_token_hash
    AND registration.consumed_at IS NULL
    AND registration.expires_at > pg_catalog.now()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'verification token invalid or expired' USING ERRCODE = '28000';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('local-email:' || v_registration.email_hash, 0));
  IF EXISTS (
    SELECT 1 FROM public.auth_local_credentials AS credential
    WHERE credential.email_hash = v_registration.email_hash
  ) THEN
    RAISE EXCEPTION 'account unavailable' USING ERRCODE = '28000';
  END IF;

  INSERT INTO public.users DEFAULT VALUES RETURNING id INTO v_user_id;
  INSERT INTO public.identities(user_id, provider, provider_subject, subject_hash, display_name)
  VALUES (
    v_user_id,
    'local_email'::public.identity_provider,
    v_registration.email_hash,
    v_registration.email_hash,
    v_registration.display_name
  );
  INSERT INTO public.auth_local_credentials(user_id, email, email_hash, password_verifier)
  VALUES (v_user_id, v_registration.email, v_registration.email_hash, v_registration.password_verifier);

  IF v_consent_version IS NOT NULL AND v_age_confirmed THEN
    INSERT INTO public.user_consents(user_id, consent_version_id, age_confirmed)
    VALUES (v_user_id, v_consent_version, true)
    ON CONFLICT (user_id, consent_version_id) DO NOTHING;
  END IF;

  INSERT INTO public.accounts(account_type, owner_user_id)
  VALUES ('USER_CASH', v_user_id), ('USER_BANK', v_user_id)
  ON CONFLICT (owner_user_id, account_type) WHERE owner_user_id IS NOT NULL DO NOTHING;
  INSERT INTO public.account_balances(account_id)
  SELECT account_row.id FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = v_user_id
    AND account_row.account_type IN ('USER_CASH', 'USER_BANK')
  ON CONFLICT (account_id) DO NOTHING;

  UPDATE public.auth_local_registrations
  SET consumed_at = pg_catalog.now()
  WHERE id = v_registration.id;
  UPDATE public.auth_sessions
  SET revoked_at = pg_catalog.now()
  WHERE id = p_pre_auth_session_id;

  INSERT INTO public.auth_sessions(id, token_hash, csrf_hash, user_id, expires_at)
  VALUES (pg_catalog.gen_random_uuid(), p_session_token_hash, p_csrf_hash, v_user_id, pg_catalog.now() + interval '30 days')
  RETURNING id INTO v_session_id;

  INSERT INTO public.auth_security_events(user_id, event_type, metadata)
  VALUES (v_user_id, 'local_registration_completed', jsonb_build_object('provider', 'local_email'));

  RETURN QUERY SELECT v_user_id, v_session_id, true;
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_local_credential_for_login(p_email_hash text)
RETURNS TABLE(user_id uuid, password_verifier text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT credential.user_id, credential.password_verifier
  FROM public.auth_local_credentials AS credential
  JOIN public.users AS user_row ON user_row.id = credential.user_id
  WHERE credential.email_hash = p_email_hash
    AND credential.disabled_at IS NULL
    AND user_row.status = 'active'::public.user_status
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.auth_complete_local_login(
  p_pre_auth_session_id uuid,
  p_user_id uuid,
  p_email_hash text,
  p_session_token_hash text,
  p_csrf_hash text
)
RETURNS TABLE(user_id uuid, session_id uuid, is_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_session_id uuid;
BEGIN
  IF p_email_hash IS NULL OR p_email_hash !~ '^[0-9a-f]{64}$'
    OR p_session_token_hash IS NULL OR p_session_token_hash !~ '^[0-9a-f]{64}$'
    OR p_csrf_hash IS NULL OR p_csrf_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid credential hash' USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.auth_sessions AS session_row
  WHERE session_row.id = p_pre_auth_session_id
    AND session_row.user_id IS NULL
    AND session_row.revoked_at IS NULL
    AND session_row.expires_at > pg_catalog.now()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'active pre-login session required' USING ERRCODE = '28000';
  END IF;

  PERFORM 1
  FROM public.auth_local_credentials AS credential
  JOIN public.users AS user_row ON user_row.id = credential.user_id
  WHERE credential.user_id = p_user_id
    AND credential.email_hash = p_email_hash
    AND credential.disabled_at IS NULL
    AND user_row.status = 'active'::public.user_status
  FOR UPDATE OF credential, user_row;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'account unavailable' USING ERRCODE = '28000';
  END IF;

  UPDATE public.auth_sessions SET revoked_at = pg_catalog.now() WHERE id = p_pre_auth_session_id;
  INSERT INTO public.auth_sessions(id, token_hash, csrf_hash, user_id, expires_at)
  VALUES (pg_catalog.gen_random_uuid(), p_session_token_hash, p_csrf_hash, p_user_id, pg_catalog.now() + interval '30 days')
  RETURNING id INTO v_session_id;

  INSERT INTO public.auth_security_events(user_id, event_type, metadata)
  VALUES (p_user_id, 'local_login_succeeded', jsonb_build_object('provider', 'local_email'));

  RETURN QUERY SELECT p_user_id, v_session_id, false;
END;
$$;

ALTER FUNCTION public.auth_start_local_registration(uuid, text, text, text, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.auth_complete_local_registration(uuid, text, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.auth_local_credential_for_login(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.auth_complete_local_login(uuid, uuid, text, text, text) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.auth_start_local_registration(uuid, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_complete_local_registration(uuid, text, text, text) FROM PUBLIC;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_local_credential_for_login(text) FROM PUBLIC;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_complete_local_login(uuid, uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_start_local_registration(uuid, text, text, text, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_complete_local_registration(uuid, text, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_local_credential_for_login(text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_complete_local_login(uuid, uuid, text, text, text) TO moneyverse_app;

COMMIT;
