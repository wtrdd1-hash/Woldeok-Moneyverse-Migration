-- OAuth identifies the member first; ConsentGuard still blocks every protected
-- feature until the authenticated session accepts the current policy versions.
BEGIN;

CREATE OR REPLACE FUNCTION public.auth_complete_oauth_login(
  p_pre_auth_session_id uuid,
  p_provider public.identity_provider,
  p_provider_subject text,
  p_display_name text,
  p_session_token_hash text,
  p_csrf_hash text
)
RETURNS TABLE(user_id uuid, session_id uuid, is_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_session_id uuid;
  v_status public.user_status;
  v_is_new boolean := false;
  v_name text;
BEGIN
  IF p_provider_subject IS NULL OR char_length(p_provider_subject) = 0 OR char_length(p_provider_subject) > 255 THEN
    RAISE EXCEPTION 'invalid OAuth provider subject' USING ERRCODE = '22023';
  END IF;
  IF p_display_name IS NULL OR char_length(btrim(p_display_name)) = 0 THEN
    RAISE EXCEPTION 'invalid OAuth display name' USING ERRCODE = '22023';
  END IF;
  IF p_session_token_hash IS NULL OR p_csrf_hash IS NULL
    OR p_session_token_hash !~ '^[0-9a-f]{64}$' OR p_csrf_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid session credential hash' USING ERRCODE = '22023';
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

  PERFORM pg_advisory_xact_lock(hashtextextended(p_provider::text || ':' || p_provider_subject, 0));
  v_name := left(btrim(p_display_name), 120);

  SELECT i.user_id, u.status
  INTO v_user_id, v_status
  FROM public.identities i
  JOIN public.users u ON u.id = i.user_id
  WHERE i.provider = p_provider AND i.provider_subject = p_provider_subject
  FOR UPDATE OF i, u;

  IF NOT FOUND THEN
    INSERT INTO public.users DEFAULT VALUES RETURNING id INTO v_user_id;
    INSERT INTO public.identities(user_id, provider, provider_subject, display_name)
    VALUES (v_user_id, p_provider, p_provider_subject, v_name);
    v_is_new := true;
  ELSIF v_status <> 'active'::public.user_status THEN
    RAISE EXCEPTION 'account unavailable' USING ERRCODE = '28000';
  ELSE
    UPDATE public.identities
    SET display_name = v_name
    WHERE provider = p_provider AND provider_subject = p_provider_subject;
  END IF;

  INSERT INTO public.accounts(account_type, owner_user_id)
  VALUES ('USER_CASH', v_user_id), ('USER_BANK', v_user_id)
  ON CONFLICT (owner_user_id, account_type) WHERE owner_user_id IS NOT NULL DO NOTHING;

  INSERT INTO public.account_balances(account_id)
  SELECT a.id
  FROM public.accounts a
  WHERE a.owner_user_id = v_user_id
    AND a.account_type IN ('USER_CASH', 'USER_BANK')
  ON CONFLICT (account_id) DO NOTHING;

  UPDATE public.auth_sessions SET revoked_at = now() WHERE id = p_pre_auth_session_id;
  INSERT INTO public.auth_sessions(id, token_hash, csrf_hash, user_id, expires_at)
  VALUES (pg_catalog.gen_random_uuid(), p_session_token_hash, p_csrf_hash, v_user_id, now() + interval '30 days')
  RETURNING id INTO v_session_id;

  RETURN QUERY SELECT v_user_id, v_session_id, v_is_new;
END;
$$;

ALTER FUNCTION public.auth_complete_oauth_login(uuid, public.identity_provider, text, text, text, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_complete_oauth_login(uuid, public.identity_provider, text, text, text, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_complete_oauth_login(uuid, public.identity_provider, text, text, text, text)
  TO moneyverse_app;

-- Extend existing valid/recent sessions to 30 days so current users are not logged out
UPDATE public.auth_sessions
SET expires_at = now() + interval '30 days'
WHERE revoked_at IS NULL
  AND user_id IS NOT NULL
  AND expires_at > now() - interval '7 days';

COMMIT;
