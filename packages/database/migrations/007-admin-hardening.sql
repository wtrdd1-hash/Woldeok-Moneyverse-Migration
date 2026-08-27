-- Administrative writes must only happen through the narrow, audited
-- SECURITY DEFINER commands below.  The web process connects as one shared
-- database role, so it must never receive direct write access to RBAC,
-- approval, or audit tables.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.user_roles,
  public.admin_approval_requests,
  public.audit_logs
  FROM PUBLIC, moneyverse_app;

-- The policy table is owned and changed by reviewed migrations.  In
-- particular, an application request cannot mark an economic action as
-- single-person or lower the required approver role.
CREATE TABLE IF NOT EXISTS public.admin_action_policies (
  action text PRIMARY KEY,
  requires_two_person_approval boolean NOT NULL DEFAULT true,
  requester_role public.admin_role NOT NULL DEFAULT 'operator'::public.admin_role,
  approver_role public.admin_role NOT NULL DEFAULT 'approver'::public.admin_role,
  active boolean NOT NULL DEFAULT true,
  CHECK (action ~ '^[a-z][a-z0-9_.:-]{2,119}$')
);

REVOKE ALL PRIVILEGES ON TABLE public.admin_action_policies FROM PUBLIC, moneyverse_app;

-- Only an explicit allow-list can enter the approval workflow.  Every
-- economic-risk action is deliberately two-person; unknown actions fail
-- closed until a reviewed migration adds their policy.
INSERT INTO public.admin_action_policies (
  action,
  requires_two_person_approval,
  requester_role,
  approver_role,
  active
) VALUES
  ('economy.policy.activate', true, 'operator', 'approver', true),
  ('economy.policy.rollback', true, 'operator', 'approver', true),
  ('economy.daily_reward_policy.update', true, 'operator', 'approver', true),
  ('economy.treasury.adjust', true, 'operator', 'approver', true),
  ('economy.mint.adjust', true, 'operator', 'approver', true),
  ('economy.reconciliation.adjust', true, 'operator', 'approver', true),
  ('economy.account.freeze', true, 'operator', 'approver', true),
  ('economy.account.unfreeze', true, 'operator', 'approver', true)
ON CONFLICT (action) DO UPDATE
SET requires_two_person_approval = EXCLUDED.requires_two_person_approval,
    requester_role = EXCLUDED.requester_role,
    approver_role = EXCLUDED.approver_role,
    active = EXCLUDED.active;

ALTER TABLE public.admin_approval_requests
  ADD COLUMN IF NOT EXISTS idempotency_key uuid,
  ADD COLUMN IF NOT EXISTS request_hash bytea,
  ADD COLUMN IF NOT EXISTS requires_two_person_approval boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS required_approver_role public.admin_role NOT NULL DEFAULT 'approver'::public.admin_role,
  ADD COLUMN IF NOT EXISTS decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS decision_reason text;

-- Historical rows may not have had an idempotency key.  New rows from the
-- command function always have both a key and a request hash.
CREATE UNIQUE INDEX IF NOT EXISTS admin_approval_requests_idempotency_key_key
  ON public.admin_approval_requests (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS previous_integrity_hash text;

-- This function is public only by name.  The application receives EXECUTE on
-- it, not SELECT on user_roles, and inactive accounts expose no roles.
CREATE OR REPLACE FUNCTION public.admin_current_roles(p_user_id uuid)
RETURNS TABLE(role public.admin_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'user id is required';
  END IF;

  RETURN QUERY
  SELECT role_row.role
  FROM public.user_roles AS role_row
  JOIN public.users AS user_row ON user_row.id = role_row.user_id
  WHERE role_row.user_id = p_user_id
    AND user_row.status = 'active'::public.user_status
  ORDER BY role_row.role;
END;
$$;

-- Internal append-only audit primitive.  It is intentionally not granted to
-- moneyverse_app; public command functions validate the actor before calling
-- it.  A transaction advisory lock makes the integrity chain deterministic
-- even when different administrative requests finish concurrently.
CREATE OR REPLACE FUNCTION public.admin_append_audit_event(
  p_actor_user_id uuid,
  p_action text,
  p_target_id uuid,
  p_request_id uuid,
  p_metadata jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_audit_id uuid;
  v_previous_hash text;
  v_integrity_hash text;
  v_created_at timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_actor_user_id IS NULL
    OR p_action IS NULL
    OR p_action !~ '^[a-z][a-z0-9_.:-]{2,119}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid audit event identity';
  END IF;

  IF p_metadata IS NULL
    OR pg_catalog.jsonb_typeof(p_metadata) <> 'object'
    OR pg_catalog.octet_length(p_metadata::text) > 16384 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid audit metadata';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin-audit-chain', 0)
  );

  SELECT audit_row.integrity_hash
  INTO v_previous_hash
  FROM public.audit_logs AS audit_row
  ORDER BY audit_row.created_at DESC, audit_row.id DESC
  LIMIT 1
  FOR UPDATE;

  v_integrity_hash := pg_catalog.encode(
    public.digest(
      pg_catalog.jsonb_build_object(
        'previousIntegrityHash', v_previous_hash,
        'actorUserId', p_actor_user_id::text,
        'action', p_action,
        'targetId', p_target_id::text,
        'requestId', p_request_id::text,
        'metadata', p_metadata,
        'createdAt', v_created_at
      )::text,
      'sha256'
    ),
    'hex'
  );

  INSERT INTO public.audit_logs (
    id,
    actor_user_id,
    action,
    target_id,
    request_id,
    metadata,
    created_at,
    previous_integrity_hash,
    integrity_hash
  ) VALUES (
    pg_catalog.gen_random_uuid(),
    p_actor_user_id,
    p_action,
    p_target_id,
    p_request_id,
    p_metadata,
    v_created_at,
    v_previous_hash,
    v_integrity_hash
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- Record an ad-hoc admin audit event.  Request creation and decisions also
-- create their own audit records through the internal primitive.
CREATE OR REPLACE FUNCTION public.admin_record_audit_event(
  p_actor_user_id uuid,
  p_action text,
  p_target_id uuid,
  p_request_id uuid,
  p_metadata jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  IF p_actor_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor user id is required';
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

  SELECT public.admin_append_audit_event(
    p_actor_user_id,
    p_action,
    p_target_id,
    p_request_id,
    p_metadata
  ) INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_approval_request(
  p_requester_id uuid,
  p_action text,
  p_payload jsonb,
  p_idempotency_key uuid,
  p_request_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_policy public.admin_action_policies%ROWTYPE;
  v_approval_id uuid;
  v_existing_requester_id uuid;
  v_existing_action text;
  v_existing_hash bytea;
  v_request_hash bytea;
BEGIN
  IF p_requester_id IS NULL OR p_idempotency_key IS NULL
    OR p_action IS NULL
    OR p_action !~ '^[a-z][a-z0-9_.:-]{2,119}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid approval request identity';
  END IF;

  IF p_payload IS NULL
    OR pg_catalog.jsonb_typeof(p_payload) <> 'object'
    OR pg_catalog.octet_length(p_payload::text) > 16384 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'approval payload must be a small JSON object';
  END IF;

  SELECT policy_row.*
  INTO v_policy
  FROM public.admin_action_policies AS policy_row
  WHERE policy_row.action = p_action
    AND policy_row.active
  FOR KEY SHARE;

  IF NOT FOUND OR v_policy.requires_two_person_approval IS NOT TRUE THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'action is not configured for two-person approval';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    JOIN public.user_roles AS role_row ON role_row.user_id = user_row.id
    WHERE user_row.id = p_requester_id
      AND user_row.status = 'active'::public.user_status
      AND role_row.role = v_policy.requester_role
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'required requester role is missing';
  END IF;

  v_request_hash := public.digest(
    pg_catalog.jsonb_build_object(
      'requesterId', p_requester_id::text,
      'action', p_action,
      'payload', p_payload
    )::text,
    'sha256'
  );

  SELECT request_row.id,
         request_row.requester_id,
         request_row.action,
         request_row.request_hash
  INTO v_approval_id,
       v_existing_requester_id,
       v_existing_action,
       v_existing_hash
  FROM public.admin_approval_requests AS request_row
  WHERE request_row.idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing_requester_id IS DISTINCT FROM p_requester_id
      OR v_existing_action IS DISTINCT FROM p_action
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different approval request';
    END IF;
    RETURN v_approval_id;
  END IF;

  -- DO NOTHING plus the read below turns simultaneous retries into one
  -- receipt instead of a unique-key error.
  INSERT INTO public.admin_approval_requests (
    requester_id,
    action,
    payload,
    idempotency_key,
    request_hash,
    requires_two_person_approval,
    required_approver_role
  ) VALUES (
    p_requester_id,
    p_action,
    p_payload,
    p_idempotency_key,
    v_request_hash,
    true,
    v_policy.approver_role
  )
  ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
  RETURNING id INTO v_approval_id;

  IF v_approval_id IS NULL THEN
    SELECT request_row.id,
           request_row.requester_id,
           request_row.action,
           request_row.request_hash
    INTO v_approval_id,
         v_existing_requester_id,
         v_existing_action,
         v_existing_hash
    FROM public.admin_approval_requests AS request_row
    WHERE request_row.idempotency_key = p_idempotency_key
    FOR UPDATE;

    IF NOT FOUND
      OR v_existing_requester_id IS DISTINCT FROM p_requester_id
      OR v_existing_action IS DISTINCT FROM p_action
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different approval request';
    END IF;

    RETURN v_approval_id;
  END IF;

  PERFORM public.admin_append_audit_event(
    p_requester_id,
    'admin.approval_request.created',
    v_approval_id,
    p_request_id,
    pg_catalog.jsonb_build_object(
      'approvalRequestId', v_approval_id::text,
      'action', p_action,
      'requiresTwoPersonApproval', true
    )
  );

  RETURN v_approval_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_decide_approval_request(
  p_approver_id uuid,
  p_approval_request_id uuid,
  p_decision text,
  p_reason text DEFAULT NULL,
  p_request_id uuid DEFAULT NULL
)
RETURNS TABLE(approval_request_id uuid, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_request public.admin_approval_requests%ROWTYPE;
  v_decision text;
  v_reason text;
BEGIN
  IF p_approver_id IS NULL OR p_approval_request_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'approver and approval request ids are required';
  END IF;

  v_decision := pg_catalog.lower(pg_catalog.btrim(coalesce(p_decision, '')));
  v_reason := NULLIF(pg_catalog.btrim(coalesce(p_reason, '')), '');

  IF v_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'decision must be approved or rejected';
  END IF;

  IF pg_catalog.char_length(coalesce(v_reason, '')) > 1000
    OR (v_decision = 'rejected' AND v_reason IS NULL) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'a rejection reason of at most 1000 characters is required';
  END IF;

  SELECT request_row.*
  INTO v_request
  FROM public.admin_approval_requests AS request_row
  WHERE request_row.id = p_approval_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'approval request not found';
  END IF;

  IF v_request.status <> 'pending'
    OR v_request.requires_two_person_approval IS NOT TRUE THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'approval request is not pending';
  END IF;

  IF v_request.requester_id = p_approver_id THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'requester cannot approve their own request';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    JOIN public.user_roles AS role_row ON role_row.user_id = user_row.id
    WHERE user_row.id = p_approver_id
      AND user_row.status = 'active'::public.user_status
      AND role_row.role = v_request.required_approver_role
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'required approver role is missing';
  END IF;

  UPDATE public.admin_approval_requests
  SET approver_id = p_approver_id,
      status = v_decision,
      decided_at = pg_catalog.clock_timestamp(),
      decision_reason = v_reason
  WHERE id = v_request.id;

  PERFORM public.admin_append_audit_event(
    p_approver_id,
    'admin.approval_request.' || v_decision,
    v_request.id,
    p_request_id,
    pg_catalog.jsonb_build_object(
      'approvalRequestId', v_request.id::text,
      'requesterId', v_request.requester_id::text,
      'decision', v_decision
    )
  );

  RETURN QUERY SELECT v_request.id, v_decision;
END;
$$;

ALTER FUNCTION public.admin_current_roles(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_append_audit_event(uuid, text, uuid, uuid, jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_record_audit_event(uuid, text, uuid, uuid, jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_create_approval_request(uuid, text, jsonb, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_decide_approval_request(uuid, uuid, text, text, uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_current_roles(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_append_audit_event(uuid, text, uuid, uuid, jsonb) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_record_audit_event(uuid, text, uuid, uuid, jsonb) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_create_approval_request(uuid, text, jsonb, uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_decide_approval_request(uuid, uuid, text, text, uuid) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_current_roles(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_record_audit_event(uuid, text, uuid, uuid, jsonb) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_create_approval_request(uuid, text, jsonb, uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_decide_approval_request(uuid, uuid, text, text, uuid) TO moneyverse_app;

COMMIT;
