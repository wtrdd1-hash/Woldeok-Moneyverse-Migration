-- The operational Terms and Privacy Policy replace the test-only documents.
-- A new pair makes the existing consent guard require a fresh acknowledgement
-- before an existing account can use an authenticated route again.
INSERT INTO public.consent_versions (terms_version, privacy_version, published_at)
VALUES ('2026-09-02', '2026-09-02', pg_catalog.now())
ON CONFLICT (terms_version, privacy_version) DO NOTHING;

-- A policy change must not force a member to create another OAuth session.
-- They remain authenticated, receive a fresh CSRF token, and can acknowledge
-- the newly published pair once.  No scheduled/monthly consent exists.
CREATE OR REPLACE FUNCTION public.auth_grant_current_user_consent(
  p_session_id uuid,
  p_terms_version text,
  p_privacy_version text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_consent_version_id uuid;
BEGIN
  SELECT session_row.user_id
  INTO v_user_id
  FROM public.auth_sessions AS session_row
  JOIN public.users AS user_row ON user_row.id = session_row.user_id
  WHERE session_row.id = p_session_id
    AND session_row.user_id IS NOT NULL
    AND session_row.revoked_at IS NULL
    AND session_row.expires_at > pg_catalog.now()
    AND user_row.status = 'active'::public.user_status;

  IF v_user_id IS NULL THEN RETURN false; END IF;

  SELECT consent_row.id
  INTO v_consent_version_id
  FROM public.consent_versions AS consent_row
  WHERE consent_row.published_at <= pg_catalog.now()
    AND consent_row.terms_version = p_terms_version
    AND consent_row.privacy_version = p_privacy_version
  ORDER BY consent_row.published_at DESC, consent_row.id DESC
  LIMIT 1;

  IF v_consent_version_id IS NULL THEN RETURN false; END IF;

  INSERT INTO public.user_consents (user_id, consent_version_id, agreed_at, age_confirmed)
  VALUES (v_user_id, v_consent_version_id, pg_catalog.now(), true)
  ON CONFLICT (user_id, consent_version_id) DO UPDATE
    SET agreed_at = EXCLUDED.agreed_at, age_confirmed = true;

  RETURN true;
END;
$$;

ALTER FUNCTION public.auth_grant_current_user_consent(uuid, text, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_grant_current_user_consent(uuid, text, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_grant_current_user_consent(uuid, text, text)
  TO moneyverse_app;
