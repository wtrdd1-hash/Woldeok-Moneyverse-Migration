BEGIN;
CREATE OR REPLACE FUNCTION public.auth_change_local_password(p_session_id uuid, p_user_id uuid, p_password_verifier text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_password_verifier IS NULL OR char_length(p_password_verifier) < 64 OR char_length(p_password_verifier) > 512 THEN
    RAISE EXCEPTION 'invalid password verifier' USING ERRCODE='22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.auth_sessions s WHERE s.id=p_session_id AND s.user_id=p_user_id AND s.revoked_at IS NULL AND s.expires_at>pg_catalog.now() AND s.reauthenticated_at >= pg_catalog.now()-interval '5 minutes') THEN
    RAISE EXCEPTION 'recent reauthentication required' USING ERRCODE='42501';
  END IF;
  UPDATE public.auth_local_credentials SET password_verifier=p_password_verifier, changed_at=pg_catalog.now() WHERE user_id=p_user_id AND disabled_at IS NULL;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.auth_sessions SET revoked_at=pg_catalog.now() WHERE user_id=p_user_id AND id<>p_session_id AND revoked_at IS NULL;
  INSERT INTO public.auth_security_events(user_id,event_type,metadata) VALUES (p_user_id,'local_password_changed',jsonb_build_object('other_sessions_revoked',true));
  RETURN true;
END; $$;
ALTER FUNCTION public.auth_change_local_password(uuid,uuid,text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_change_local_password(uuid,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_change_local_password(uuid,uuid,text) TO moneyverse_app;
COMMIT;
