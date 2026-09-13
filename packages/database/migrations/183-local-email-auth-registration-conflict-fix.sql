-- 183-local-email-auth-registration-conflict-fix.sql
-- Update version: v2026.09.13.46
--
-- auth_complete_local_registration() RETURNS TABLE exposes an OUT parameter
-- named user_id. PostgreSQL therefore treated the unqualified user_id inside
-- ON CONFLICT (user_id, consent_version_id) as ambiguous (SQLSTATE 42702),
-- causing verified first-party registrations to fail at the final step.
-- Use the table's named primary-key constraint so no PL/pgSQL variable can
-- collide with the conflict target. The rest of the function is unchanged.

BEGIN;

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
    ON CONFLICT ON CONSTRAINT user_consents_pkey DO NOTHING;
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


ALTER FUNCTION public.auth_complete_local_registration(uuid, text, text, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_complete_local_registration(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_complete_local_registration(uuid, text, text, text) TO moneyverse_app;

COMMIT;
