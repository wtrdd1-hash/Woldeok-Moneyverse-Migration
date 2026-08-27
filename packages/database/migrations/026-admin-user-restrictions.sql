-- User restrictions are deliberately an auditable, privileged command. They
-- never delete account data and a restricted user may still request deletion.
CREATE TABLE IF NOT EXISTS public.user_restrictions (
  user_id uuid PRIMARY KEY REFERENCES public.users(id),
  restricted_by uuid NOT NULL REFERENCES public.users(id),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 1000),
  restricted_at timestamptz NOT NULL DEFAULT now(),
  lifted_by uuid REFERENCES public.users(id),
  lifted_at timestamptz
);
REVOKE ALL ON public.user_restrictions FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_set_user_restriction(p_actor uuid, p_target uuid, p_restricted boolean, p_reason text, p_request_id uuid DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_previous text;
BEGIN
  IF p_actor=p_target OR p_reason IS NULL OR char_length(trim(p_reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid restriction request'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.users u ON u.id=r.user_id WHERE r.user_id=p_actor AND r.role='approver'::public.admin_role AND u.status='active'::public.user_status) THEN RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='approver role required'; END IF;
  SELECT status::text INTO v_previous FROM public.users WHERE id=p_target FOR UPDATE;
  IF v_previous IS NULL OR v_previous='deleted' THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active target required'; END IF;
  IF p_restricted THEN
    UPDATE public.users SET status='restricted'::public.user_status WHERE id=p_target;
    INSERT INTO public.user_restrictions(user_id,restricted_by,reason) VALUES(p_target,p_actor,trim(p_reason)) ON CONFLICT(user_id) DO UPDATE SET restricted_by=EXCLUDED.restricted_by,reason=EXCLUDED.reason,restricted_at=now(),lifted_by=NULL,lifted_at=NULL;
  ELSE
    UPDATE public.users SET status='active'::public.user_status WHERE id=p_target AND status='restricted'::public.user_status;
    UPDATE public.user_restrictions SET lifted_by=p_actor,lifted_at=now() WHERE user_id=p_target;
  END IF;
  PERFORM public.admin_record_audit_event(p_actor, CASE WHEN p_restricted THEN 'user.restricted' ELSE 'user.restriction_lifted' END, p_target, p_request_id, jsonb_build_object('reason',trim(p_reason),'previousStatus',v_previous));
  RETURN true;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_set_user_restriction(uuid,uuid,boolean,text,uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_list_users(p_actor uuid, p_limit integer DEFAULT 50)
RETURNS TABLE(user_id uuid,status text,display_name text,created_at timestamptz,restricted_at timestamptz,restriction_reason text)
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
  SELECT u.id,u.status::text,COALESCE(i.display_name,'사용자'),u.created_at,r.restricted_at,r.reason
  FROM public.users u LEFT JOIN LATERAL (SELECT display_name FROM public.identities WHERE user_id=u.id ORDER BY linked_at LIMIT 1) i ON true
  LEFT JOIN public.user_restrictions r ON r.user_id=u.id AND r.lifted_at IS NULL
  WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id=p_actor AND ur.role='approver'::public.admin_role)
  ORDER BY u.created_at DESC LIMIT greatest(1,least(p_limit,100))
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_users(uuid,integer) TO moneyverse_app;
