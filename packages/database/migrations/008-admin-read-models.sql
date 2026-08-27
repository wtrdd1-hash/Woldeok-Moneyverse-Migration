-- Read models for the admin console.  The shared application role keeps no
-- direct SELECT privilege on the approval/audit tables. Approval visibility
-- is scoped to a requester or the exact required approver role; full audit
-- visibility (including integrity-chain values) belongs only to approvers.
BEGIN;

-- `003-mvp-features.sql` granted the app broad access while the prototype was
-- being built. Minecraft operations are no longer written directly by the
-- web process. A reviewed host-agent execution workflow will add a separate,
-- durable command path before mutations are enabled.
REVOKE ALL PRIVILEGES ON TABLE public.minecraft_operations FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_list_approval_requests(
  p_actor_user_id uuid,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  approval_request_id uuid,
  requester_id uuid,
  approver_id uuid,
  action text,
  payload jsonb,
  status text,
  requires_two_person_approval boolean,
  created_at timestamptz,
  decided_at timestamptz,
  decision_reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor_user_id IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'valid administrator and limit are required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    JOIN public.user_roles AS role_row ON role_row.user_id = user_row.id
    WHERE user_row.id = p_actor_user_id
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active administrator role required';
  END IF;

  -- An operator can only read requests they created. An approver can read a
  -- request only when they hold the exact role required to decide it. This
  -- prevents a server-only operator from browsing economy payloads.
  RETURN QUERY
  SELECT
    request_row.id,
    request_row.requester_id,
    request_row.approver_id,
    request_row.action,
    request_row.payload,
    request_row.status,
    request_row.requires_two_person_approval,
    request_row.created_at,
    request_row.decided_at,
    request_row.decision_reason
  FROM public.admin_approval_requests AS request_row
  WHERE request_row.requester_id = p_actor_user_id
     OR EXISTS (
       SELECT 1
       FROM public.user_roles AS role_row
       WHERE role_row.user_id = p_actor_user_id
         AND role_row.role = request_row.required_approver_role
     )
  ORDER BY request_row.created_at DESC, request_row.id DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_recent_audit_events(
  p_actor_user_id uuid,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  audit_id uuid,
  actor_user_id uuid,
  action text,
  target_id uuid,
  request_id uuid,
  metadata jsonb,
  created_at timestamptz,
  previous_integrity_hash text,
  integrity_hash text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor_user_id IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'valid administrator and limit are required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    JOIN public.user_roles AS role_row ON role_row.user_id = user_row.id
    WHERE user_row.id = p_actor_user_id
      AND user_row.status = 'active'::public.user_status
      AND role_row.role = 'approver'::public.admin_role
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active approver role required for audit visibility';
  END IF;

  RETURN QUERY
  SELECT
    audit_row.id,
    audit_row.actor_user_id,
    audit_row.action,
    audit_row.target_id,
    audit_row.request_id,
    audit_row.metadata,
    audit_row.created_at,
    audit_row.previous_integrity_hash,
    audit_row.integrity_hash
  FROM public.audit_logs AS audit_row
  ORDER BY audit_row.created_at DESC, audit_row.id DESC
  LIMIT p_limit;
END;
$$;

ALTER FUNCTION public.admin_list_approval_requests(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_recent_audit_events(uuid, integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_approval_requests(uuid, integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_recent_audit_events(uuid, integer)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_list_approval_requests(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_recent_audit_events(uuid, integer) TO moneyverse_app;

COMMIT;
