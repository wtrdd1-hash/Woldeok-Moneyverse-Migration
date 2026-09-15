BEGIN;

CREATE OR REPLACE FUNCTION public.admin_permanent_suspend_account(
  p_actor uuid,
  p_target uuid,
  p_reason text,
  p_request_id uuid DEFAULT NULL
)
RETURNS TABLE(changed boolean, revoked_sessions integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_previous public.user_status;
  v_reason text;
  v_sessions integer := 0;
BEGIN
  IF p_actor IS NULL OR p_target IS NULL OR p_actor = p_target THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid permanent suspension request';
  END IF;
  v_reason := trim(coalesce(p_reason, ''));
  IF char_length(v_reason) NOT BETWEEN 3 AND 1000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'suspension reason must be 3..1000 characters';
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  SELECT user_row.status INTO v_previous
  FROM public.users AS user_row
  WHERE user_row.id = p_target
  FOR UPDATE;

  IF v_previous IS NULL OR v_previous = 'deleted'::public.user_status THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active or restricted target required';
  END IF;

  UPDATE public.users AS user_row
  SET status = 'restricted'::public.user_status
  WHERE user_row.id = p_target;

  INSERT INTO public.user_restrictions AS restriction_row (
    user_id, restricted_by, reason, restricted_at, lifted_by, lifted_at
  ) VALUES (
    p_target, p_actor, v_reason, pg_catalog.clock_timestamp(), NULL, NULL
  )
  ON CONFLICT (user_id) DO UPDATE
  SET restricted_by = EXCLUDED.restricted_by,
      reason = EXCLUDED.reason,
      restricted_at = EXCLUDED.restricted_at,
      lifted_by = NULL,
      lifted_at = NULL;

  UPDATE public.auth_sessions AS session_row
  SET revoked_at = pg_catalog.clock_timestamp()
  WHERE session_row.user_id = p_target AND session_row.revoked_at IS NULL;
  GET DIAGNOSTICS v_sessions = ROW_COUNT;

  PERFORM public.admin_record_audit_event(
    p_actor,
    'user.permanent_suspended',
    p_target,
    p_request_id,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'previousStatus', v_previous::text,
      'revokedSessions', v_sessions
    )
  );

  RETURN QUERY SELECT true, v_sessions;
END;
$$;

ALTER FUNCTION public.admin_permanent_suspend_account(uuid,uuid,text,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_permanent_suspend_account(uuid,uuid,text,uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_permanent_suspend_account(uuid,uuid,text,uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_list_ip_blocks(
  p_actor uuid,
  p_limit integer DEFAULT 100
)
RETURNS TABLE(
  block_id uuid,
  network inet,
  reason text,
  blocked_by uuid,
  blocked_at timestamptz,
  expires_at timestamptz,
  lifted_by uuid,
  lifted_at timestamptz,
  active boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.admin_require_superadmin(p_actor);
  RETURN QUERY
  SELECT block_row.id,
         block_row.network,
         block_row.reason,
         block_row.blocked_by,
         block_row.blocked_at,
         block_row.expires_at,
         block_row.lifted_by,
         block_row.lifted_at,
         block_row.lifted_at IS NULL
           AND (block_row.expires_at IS NULL OR block_row.expires_at > pg_catalog.clock_timestamp())
  FROM public.admin_ip_blocks AS block_row
  ORDER BY block_row.blocked_at DESC
  LIMIT greatest(1, least(coalesce(p_limit, 100), 200));
END;
$$;

ALTER FUNCTION public.admin_list_ip_blocks(uuid,integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_list_ip_blocks(uuid,integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_ip_blocks(uuid,integer) TO moneyverse_app;

COMMIT;
