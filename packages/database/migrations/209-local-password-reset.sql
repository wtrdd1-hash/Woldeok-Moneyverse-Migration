-- v2026.09.19.266 — one-time local-account password recovery.
BEGIN;

CREATE TABLE IF NOT EXISTS public.auth_local_password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_local_password_resets_token_hash_check CHECK (token_hash ~ '^[0-9a-f]{64}$')
);
CREATE INDEX IF NOT EXISTS auth_local_password_resets_active_user_idx
  ON public.auth_local_password_resets(user_id, expires_at DESC)
  WHERE consumed_at IS NULL;
REVOKE ALL PRIVILEGES ON TABLE public.auth_local_password_resets FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.auth_start_local_password_reset(p_email_hash text, p_token_hash text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_user_id uuid;
BEGIN
  IF p_email_hash IS NULL OR p_email_hash !~ '^[0-9a-f]{64}$'
    OR p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid password reset input' USING ERRCODE = '22023';
  END IF;
  SELECT c.user_id INTO v_user_id
  FROM public.auth_local_credentials c JOIN public.users u ON u.id = c.user_id
  WHERE c.email_hash = p_email_hash AND c.disabled_at IS NULL AND u.status = 'active'::public.user_status
  FOR UPDATE OF c, u;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.auth_local_password_resets SET consumed_at = pg_catalog.now()
    WHERE user_id = v_user_id AND consumed_at IS NULL;
  INSERT INTO public.auth_local_password_resets(user_id, token_hash, expires_at)
    VALUES (v_user_id, p_token_hash, pg_catalog.now() + interval '30 minutes');
  INSERT INTO public.auth_security_events(user_id,event_type,metadata)
    VALUES (v_user_id,'local_password_reset_requested','{}'::jsonb);
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.auth_complete_local_password_reset(p_token_hash text, p_password_verifier text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_reset public.auth_local_password_resets%ROWTYPE;
BEGIN
  IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$'
    OR p_password_verifier IS NULL OR char_length(p_password_verifier) < 64 OR char_length(p_password_verifier) > 512 THEN
    RAISE EXCEPTION 'invalid password reset input' USING ERRCODE = '22023';
  END IF;
  SELECT r.* INTO v_reset FROM public.auth_local_password_resets r
    JOIN public.users u ON u.id = r.user_id
    JOIN public.auth_local_credentials c ON c.user_id = r.user_id
    WHERE r.token_hash = p_token_hash AND r.consumed_at IS NULL AND r.expires_at > pg_catalog.now()
      AND c.disabled_at IS NULL AND u.status = 'active'::public.user_status
    FOR UPDATE OF r, u, c;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.auth_local_credentials SET password_verifier = p_password_verifier, changed_at = pg_catalog.now()
    WHERE user_id = v_reset.user_id;
  UPDATE public.auth_local_password_resets SET consumed_at = pg_catalog.now() WHERE id = v_reset.id;
  UPDATE public.auth_sessions SET revoked_at = pg_catalog.now()
    WHERE user_id = v_reset.user_id AND revoked_at IS NULL;
  INSERT INTO public.auth_security_events(user_id,event_type,metadata)
    VALUES (v_reset.user_id,'local_password_reset_completed',jsonb_build_object('sessions_revoked',true));
  RETURN true;
END; $$;

ALTER FUNCTION public.auth_start_local_password_reset(text,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.auth_complete_local_password_reset(text,text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_start_local_password_reset(text,text) FROM PUBLIC;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_complete_local_password_reset(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_start_local_password_reset(text,text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_complete_local_password_reset(text,text) TO moneyverse_app;
COMMIT;
