-- v2026.09.15.125 — retire administrator TOTP / second-factor recovery.
-- Administrator protection remains: role checks, rotated short-lived admin
-- sessions, CSRF, IP allowlist, database actor checks and append-only audit.

CREATE OR REPLACE FUNCTION public.admin_evaluate_login_context(
  p_actor uuid,
  p_ip_address inet,
  p_device_hash text
)
RETURNS TABLE(decision text, reason text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_has_allowlist boolean;
  v_address_allowed boolean := false;
  v_decision text;
  v_reason text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='administrator role required';
  END IF;
  SELECT EXISTS (SELECT 1 FROM public.admin_ip_allowlist a WHERE a.user_id=p_actor)
  INTO v_has_allowlist;
  IF v_has_allowlist AND p_ip_address IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM public.admin_ip_allowlist a WHERE a.user_id=p_actor AND p_ip_address <<= a.network)
    INTO v_address_allowed;
  END IF;  IF v_has_allowlist AND NOT v_address_allowed THEN
    v_decision := 'block'; v_reason := 'address outside the administrator allowlist';
  ELSE
    v_decision := 'allow'; v_reason := 'authenticated administrator session';
  END IF;
  INSERT INTO public.admin_login_attempts(user_id,ip_address,device_hash,decision,reason)
  VALUES(p_actor,p_ip_address,NULL,v_decision,v_reason);
  IF v_decision='block' THEN
    PERFORM public.admin_append_audit_event(p_actor,'admin.login.blocked',p_actor,NULL,
      pg_catalog.jsonb_build_object('reason',v_reason));
  END IF;
  RETURN QUERY SELECT v_decision,v_reason;
END $$;

CREATE OR REPLACE FUNCTION public.admin_login_policy(p_actor uuid, p_target uuid)
RETURNS TABLE(kind text, value text, label text, recorded_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_actor IS NULL OR p_target IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='actor and target are required';
  END IF;
  IF p_actor <> p_target THEN
    PERFORM public.admin_require_superadmin(p_actor);
  ELSIF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='administrator role required';
  END IF;  RETURN QUERY SELECT 'network'::text,a.network::text,a.label,a.created_at
  FROM public.admin_ip_allowlist a WHERE a.user_id=p_target ORDER BY a.created_at DESC;
END $$;

DROP FUNCTION IF EXISTS public.admin_recovery_code_open_session(uuid,uuid,text,text,text);
DROP FUNCTION IF EXISTS public.admin_recovery_codes_issue(uuid,uuid,text[]);
DROP TABLE IF EXISTS public.admin_recovery_codes;
DROP TABLE IF EXISTS public.admin_recovery_code_state;

DROP FUNCTION IF EXISTS public.admin_trust_device(uuid,text,text);
DROP FUNCTION IF EXISTS public.admin_totp_begin_enrolment(uuid,uuid,text,text,smallint,integer);
DROP FUNCTION IF EXISTS public.admin_totp_confirm_enrolment(uuid,uuid,bigint);
DROP FUNCTION IF EXISTS public.admin_totp_sealed_secret(uuid);
DROP FUNCTION IF EXISTS public.admin_totp_consume(uuid,bigint);
DROP FUNCTION IF EXISTS public.admin_totp_record_failure(uuid);
DROP FUNCTION IF EXISTS public.admin_second_factor_satisfied(uuid,integer);
DROP TABLE IF EXISTS public.admin_totp_credentials;
DROP TABLE IF EXISTS public.admin_trusted_devices;

ALTER FUNCTION public.admin_evaluate_login_context(uuid,inet,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_login_policy(uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_evaluate_login_context(uuid,inet,text), public.admin_login_policy(uuid,uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_evaluate_login_context(uuid,inet,text), public.admin_login_policy(uuid,uuid)
  TO moneyverse_app;