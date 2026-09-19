BEGIN;
CREATE TABLE IF NOT EXISTS public.auth_local_email_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email text NOT NULL, email_hash text NOT NULL, verification_token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL, consumed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (email_hash ~ '^[0-9a-f]{64}$'), CHECK (verification_token_hash ~ '^[0-9a-f]{64}$')
);
CREATE UNIQUE INDEX IF NOT EXISTS auth_local_email_changes_active_user_idx ON public.auth_local_email_changes(user_id) WHERE consumed_at IS NULL;
REVOKE ALL PRIVILEGES ON TABLE public.auth_local_email_changes FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.auth_start_local_email_change(p_session_id uuid,p_user_id uuid,p_email text,p_email_hash text,p_token_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
  IF p_email IS NULL OR char_length(p_email) NOT BETWEEN 3 AND 254 OR p_email_hash !~ '^[0-9a-f]{64}$' OR p_token_hash !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'invalid email change input' USING ERRCODE='22023'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.auth_sessions s WHERE s.id=p_session_id AND s.user_id=p_user_id AND s.revoked_at IS NULL AND s.expires_at>now() AND s.reauthenticated_at>=now()-interval '5 minutes') THEN RAISE EXCEPTION 'recent reauthentication required' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.auth_local_credentials c WHERE c.user_id=p_user_id AND c.disabled_at IS NULL) THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.auth_local_credentials c WHERE c.email_hash=p_email_hash AND c.user_id<>p_user_id AND c.disabled_at IS NULL) THEN RETURN false; END IF;
  UPDATE public.auth_local_email_changes SET consumed_at=now() WHERE user_id=p_user_id AND consumed_at IS NULL;
  INSERT INTO public.auth_local_email_changes(user_id,email,email_hash,verification_token_hash,expires_at) VALUES(p_user_id,p_email,p_email_hash,p_token_hash,now()+interval '30 minutes');
  INSERT INTO public.auth_security_events(user_id,event_type,metadata) VALUES(p_user_id,'local_email_change_requested','{}'::jsonb);
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.auth_complete_local_email_change(p_token_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v public.auth_local_email_changes%ROWTYPE;
BEGIN
  SELECT * INTO v FROM public.auth_local_email_changes WHERE verification_token_hash=p_token_hash AND consumed_at IS NULL AND expires_at>now() FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.auth_local_credentials c WHERE c.email_hash=v.email_hash AND c.user_id<>v.user_id AND c.disabled_at IS NULL) THEN RETURN false; END IF;
  UPDATE public.auth_local_credentials SET email=v.email,email_hash=v.email_hash,verified_at=now(),changed_at=now() WHERE user_id=v.user_id AND disabled_at IS NULL;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.identities SET provider_subject=v.email_hash,subject_hash=v.email_hash WHERE user_id=v.user_id AND provider='local_email'::public.identity_provider;
  UPDATE public.auth_local_email_changes SET consumed_at=now() WHERE id=v.id;
  UPDATE public.auth_sessions SET revoked_at=now() WHERE user_id=v.user_id AND revoked_at IS NULL;
  INSERT INTO public.auth_security_events(user_id,event_type,metadata) VALUES(v.user_id,'local_email_changed',jsonb_build_object('sessions_revoked',true));
  RETURN true;
END $$;
ALTER FUNCTION public.auth_start_local_email_change(uuid,uuid,text,text,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.auth_complete_local_email_change(text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.auth_start_local_email_change(uuid,uuid,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_complete_local_email_change(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_start_local_email_change(uuid,uuid,text,text,text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.auth_complete_local_email_change(text) TO moneyverse_app;
COMMIT;
