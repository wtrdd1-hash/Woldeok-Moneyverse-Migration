-- Minecraft host control is intentionally a two-stage, database-owned
-- workflow.  A server operator can request one fixed operation, a different
-- approver must approve it, and a separately provisioned executor can lease
-- the approved record exactly once.  This migration never accepts a command,
-- URL, host, or arbitrary host-agent request body.
BEGIN;

CREATE TABLE IF NOT EXISTS public.minecraft_approved_operations (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  approval_request_id uuid NOT NULL UNIQUE
    REFERENCES public.admin_approval_requests(id) ON DELETE RESTRICT,
  requester_user_id uuid NOT NULL
    REFERENCES public.users(id) ON DELETE RESTRICT,
  operation text NOT NULL
    CHECK (operation IN ('start', 'stop', 'restart', 'status', 'logs')),
  idempotency_key uuid NOT NULL UNIQUE,
  request_hash bytea NOT NULL
    CHECK (pg_catalog.octet_length(request_hash) = 32),
  state text NOT NULL DEFAULT 'pending_approval'
    CHECK (state IN (
      'pending_approval',
      'approved',
      'rejected',
      'leased',
      'lease_expired',
      'succeeded',
      'failed'
    )),
  approved_by_user_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  approved_at timestamptz,
  lease_token_hash bytea
    CHECK (lease_token_hash IS NULL OR pg_catalog.octet_length(lease_token_hash) = 32),
  lease_expires_at timestamptz,
  lease_started_at timestamptz,
  lease_attempt_count integer NOT NULL DEFAULT 0
    CHECK (lease_attempt_count BETWEEN 0 AND 1),
  agent_request_id text
    CHECK (
      agent_request_id IS NULL
      OR agent_request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'
    ),
  result_summary jsonb
    CHECK (
      result_summary IS NULL
      OR (
        pg_catalog.jsonb_typeof(result_summary) = 'object'
        AND pg_catalog.octet_length(result_summary::text) <= 4096
      )
    ),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CHECK (
    (state = 'pending_approval'
      AND approved_by_user_id IS NULL
      AND approved_at IS NULL
      AND lease_token_hash IS NULL
      AND lease_expires_at IS NULL
      AND lease_started_at IS NULL
      AND lease_attempt_count = 0
      AND agent_request_id IS NULL
      AND result_summary IS NULL
      AND finished_at IS NULL)
    OR
    (state = 'approved'
      AND approved_by_user_id IS NOT NULL
      AND approved_at IS NOT NULL
      AND lease_token_hash IS NULL
      AND lease_expires_at IS NULL
      AND lease_started_at IS NULL
      AND lease_attempt_count = 0
      AND agent_request_id IS NULL
      AND result_summary IS NULL
      AND finished_at IS NULL)
    OR
    (state = 'rejected'
      AND approved_by_user_id IS NOT NULL
      AND approved_at IS NOT NULL
      AND lease_token_hash IS NULL
      AND lease_expires_at IS NULL
      AND lease_started_at IS NULL
      AND lease_attempt_count = 0
      AND agent_request_id IS NULL
      AND result_summary IS NULL
      AND finished_at IS NOT NULL)
    OR
    (state = 'leased'
      AND approved_by_user_id IS NOT NULL
      AND approved_at IS NOT NULL
      AND lease_token_hash IS NOT NULL
      AND lease_expires_at IS NOT NULL
      AND lease_started_at IS NOT NULL
      AND lease_attempt_count = 1
      AND agent_request_id IS NULL
      AND result_summary IS NULL
      AND finished_at IS NULL)
    OR
    (state = 'lease_expired'
      AND approved_by_user_id IS NOT NULL
      AND approved_at IS NOT NULL
      AND lease_token_hash IS NOT NULL
      AND lease_expires_at IS NOT NULL
      AND lease_started_at IS NOT NULL
      AND lease_attempt_count = 1
      AND agent_request_id IS NULL
      AND result_summary IS NULL
      AND finished_at IS NOT NULL)
    OR
    (state IN ('succeeded', 'failed')
      AND approved_by_user_id IS NOT NULL
      AND approved_at IS NOT NULL
      AND lease_token_hash IS NOT NULL
      AND lease_expires_at IS NOT NULL
      AND lease_started_at IS NOT NULL
      AND lease_attempt_count = 1
      AND result_summary IS NOT NULL
      AND finished_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS minecraft_approved_operations_ready_idx
  ON public.minecraft_approved_operations (approved_at, id)
  WHERE state = 'approved';
CREATE INDEX IF NOT EXISTS minecraft_approved_operations_requester_idx
  ON public.minecraft_approved_operations (requester_user_id, created_at DESC, id DESC);

-- This event stream is append-only.  It complements the existing chained
-- admin audit log with execution lifecycle events that have no human actor
-- (lease expiry, completion) and therefore cannot be represented safely by
-- admin_append_audit_event.
CREATE TABLE IF NOT EXISTS public.minecraft_approved_operation_events (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  operation_id uuid NOT NULL
    REFERENCES public.minecraft_approved_operations(id) ON DELETE RESTRICT,
  event_type text NOT NULL
    CHECK (event_type IN (
      'requested',
      'approved',
      'rejected',
      'leased',
      'lease_expired',
      'succeeded',
      'failed'
    )),
  actor_user_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (
      pg_catalog.jsonb_typeof(metadata) = 'object'
      AND pg_catalog.octet_length(metadata::text) <= 4096
    ),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS minecraft_approved_operation_events_operation_idx
  ON public.minecraft_approved_operation_events (operation_id, created_at, id);

-- Fixed policies are the first gate: only server operators can request these
-- actions, and only a different user with the approver role can decide them
-- through admin_decide_approval_request.
INSERT INTO public.admin_action_policies (
  action,
  requires_two_person_approval,
  requester_role,
  approver_role,
  active
) VALUES
  ('minecraft.operation.start', true, 'server_operator'::public.admin_role, 'approver'::public.admin_role, true),
  ('minecraft.operation.stop', true, 'server_operator'::public.admin_role, 'approver'::public.admin_role, true),
  ('minecraft.operation.restart', true, 'server_operator'::public.admin_role, 'approver'::public.admin_role, true),
  ('minecraft.operation.status', true, 'server_operator'::public.admin_role, 'approver'::public.admin_role, true),
  ('minecraft.operation.logs', true, 'server_operator'::public.admin_role, 'approver'::public.admin_role, true)
ON CONFLICT (action) DO UPDATE
SET requires_two_person_approval = EXCLUDED.requires_two_person_approval,
    requester_role = EXCLUDED.requester_role,
    approver_role = EXCLUDED.approver_role,
    active = EXCLUDED.active;

-- Keep the domain event stream immutable after insertion.  Direct application
-- DML is revoked below, but this trigger also catches accidental privileged
-- code paths that attempt to rewrite execution history.
CREATE OR REPLACE FUNCTION public.minecraft_reject_approved_operation_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'minecraft operation events are append-only';
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.minecraft_approved_operation_events'::pg_catalog.regclass
      AND trigger_row.tgname = 'minecraft_approved_operation_events_immutable'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER minecraft_approved_operation_events_immutable
      BEFORE UPDATE OR DELETE ON public.minecraft_approved_operation_events
      FOR EACH ROW
      EXECUTE FUNCTION public.minecraft_reject_approved_operation_event_mutation();
  END IF;
END;
$do$;

-- An approval request is the authoritative two-person decision.  The trigger
-- only transitions a linked durable operation if all immutable binding fields
-- match the DB-owned request shape.  A generic approval request with the same
-- action but no durable operation remains inert and can never be leased.
CREATE OR REPLACE FUNCTION public.minecraft_sync_approved_operation_from_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_operation_id uuid;
  v_operation text;
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF NEW.action NOT IN (
    'minecraft.operation.start',
    'minecraft.operation.stop',
    'minecraft.operation.restart',
    'minecraft.operation.status',
    'minecraft.operation.logs'
  ) OR NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('approved', 'rejected') THEN
    RETURN NEW;
  END IF;

  IF NEW.approver_id IS NULL OR NEW.approver_id = NEW.requester_id THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'minecraft approval requires a different approver';
  END IF;

  IF NEW.status = 'approved' THEN
    UPDATE public.minecraft_approved_operations AS operation_row
    SET state = 'approved',
        approved_by_user_id = NEW.approver_id,
        approved_at = v_now,
        updated_at = v_now
    WHERE operation_row.approval_request_id = NEW.id
      AND operation_row.requester_user_id = NEW.requester_id
      AND NEW.action = 'minecraft.operation.' || operation_row.operation
      AND NEW.payload = pg_catalog.jsonb_build_object('operation', operation_row.operation)
      AND operation_row.state = 'pending_approval'
    RETURNING operation_row.id, operation_row.operation INTO v_operation_id, v_operation;
  ELSE
    UPDATE public.minecraft_approved_operations AS operation_row
    SET state = 'rejected',
        approved_by_user_id = NEW.approver_id,
        approved_at = v_now,
        finished_at = v_now,
        updated_at = v_now
    WHERE operation_row.approval_request_id = NEW.id
      AND operation_row.requester_user_id = NEW.requester_id
      AND NEW.action = 'minecraft.operation.' || operation_row.operation
      AND NEW.payload = pg_catalog.jsonb_build_object('operation', operation_row.operation)
      AND operation_row.state = 'pending_approval'
    RETURNING operation_row.id, operation_row.operation INTO v_operation_id, v_operation;
  END IF;

  IF v_operation_id IS NULL THEN
    -- Normal generic admin approvals do not have an operation receipt and are
    -- intentionally ignored.  A receipt that fails the binding checks is a
    -- corruption attempt and must fail the decision transaction closed.
    IF EXISTS (
      SELECT 1
      FROM public.minecraft_approved_operations AS operation_row
      WHERE operation_row.approval_request_id = NEW.id
    ) THEN
      RAISE EXCEPTION USING ERRCODE = '55000',
        MESSAGE = 'minecraft approval does not match its operation receipt';
    END IF;
    RETURN NEW;
  END IF;

  INSERT INTO public.minecraft_approved_operation_events (
    operation_id,
    event_type,
    actor_user_id,
    metadata,
    created_at
  ) VALUES (
    v_operation_id,
    NEW.status,
    NEW.approver_id,
    pg_catalog.jsonb_build_object(
      'approvalRequestId', NEW.id::text,
      'operation', v_operation
    ),
    v_now
  );

  PERFORM public.admin_append_audit_event(
    NEW.approver_id,
    'minecraft.operation.' || NEW.status,
    v_operation_id,
    NULL,
    pg_catalog.jsonb_build_object(
      'approvalRequestId', NEW.id::text,
      'operation', v_operation
    )
  );

  RETURN NEW;
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.admin_approval_requests'::pg_catalog.regclass
      AND trigger_row.tgname = 'minecraft_approved_operation_approval_sync'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER minecraft_approved_operation_approval_sync
      AFTER UPDATE OF status ON public.admin_approval_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.minecraft_sync_approved_operation_from_approval();
  END IF;
END;
$do$;

-- Create an immutable receipt and the matching generic approval in one
-- transaction.  The action/payload are generated here, not accepted from the
-- caller, so an approved record can only represent one of the five routes in
-- minecraft-agent/host-agent-client.
CREATE OR REPLACE FUNCTION public.minecraft_request_approved_operation(
  p_requester_user_id uuid,
  p_operation text,
  p_idempotency_key uuid
)
RETURNS TABLE(
  operation_id uuid,
  approval_request_id uuid,
  operation text,
  state text,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_operation text;
  v_action text;
  v_request_hash bytea;
  v_approval_request_id uuid;
  v_approval_status text;
  v_existing_operation_id uuid;
  v_existing_requester_user_id uuid;
  v_existing_operation text;
  v_existing_approval_request_id uuid;
  v_existing_request_hash bytea;
  v_existing_state text;
BEGIN
  IF p_requester_user_id IS NULL OR p_idempotency_key IS NULL
    OR p_operation NOT IN ('start', 'stop', 'restart', 'status', 'logs') THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'fixed minecraft operation, requester, and idempotency key are required';
  END IF;

  v_operation := p_operation;
  v_action := 'minecraft.operation.' || v_operation;
  v_request_hash := public.digest(
    pg_catalog.jsonb_build_object(
      'requesterUserId', p_requester_user_id::text,
      'operation', v_operation
    )::text,
    'sha256'
  );

  SELECT
    operation_row.id,
    operation_row.requester_user_id,
    operation_row.operation,
    operation_row.approval_request_id,
    operation_row.request_hash,
    operation_row.state
  INTO
    v_existing_operation_id,
    v_existing_requester_user_id,
    v_existing_operation,
    v_existing_approval_request_id,
    v_existing_request_hash,
    v_existing_state
  FROM public.minecraft_approved_operations AS operation_row
  WHERE operation_row.idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing_requester_user_id IS DISTINCT FROM p_requester_user_id
      OR v_existing_operation IS DISTINCT FROM v_operation
      OR v_existing_request_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different minecraft operation';
    END IF;

    RETURN QUERY SELECT
      v_existing_operation_id,
      v_existing_approval_request_id,
      v_existing_operation,
      v_existing_state,
      true;
    RETURN;
  END IF;

  SELECT public.admin_create_approval_request(
    p_requester_user_id,
    v_action,
    pg_catalog.jsonb_build_object('operation', v_operation),
    p_idempotency_key,
    NULL
  ) INTO v_approval_request_id;

  -- A generic request that has already been decided cannot later be bound to
  -- a fresh operation receipt.  During ordinary use the request was inserted
  -- above and is still pending in this transaction.
  SELECT request_row.status
  INTO v_approval_status
  FROM public.admin_approval_requests AS request_row
  WHERE request_row.id = v_approval_request_id
    AND request_row.requester_id = p_requester_user_id
    AND request_row.action = v_action
    AND request_row.payload = pg_catalog.jsonb_build_object('operation', v_operation)
  FOR KEY SHARE;
  IF v_approval_status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'minecraft approval request is unavailable for an operation receipt';
  END IF;

  INSERT INTO public.minecraft_approved_operations (
    approval_request_id,
    requester_user_id,
    operation,
    idempotency_key,
    request_hash
  ) VALUES (
    v_approval_request_id,
    p_requester_user_id,
    v_operation,
    p_idempotency_key,
    v_request_hash
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_existing_operation_id;

  IF v_existing_operation_id IS NULL THEN
    SELECT
      operation_row.id,
      operation_row.requester_user_id,
      operation_row.operation,
      operation_row.approval_request_id,
      operation_row.request_hash,
      operation_row.state
    INTO
      v_existing_operation_id,
      v_existing_requester_user_id,
      v_existing_operation,
      v_existing_approval_request_id,
      v_existing_request_hash,
      v_existing_state
    FROM public.minecraft_approved_operations AS operation_row
    WHERE operation_row.idempotency_key = p_idempotency_key
    FOR UPDATE;

    IF NOT FOUND
      OR v_existing_requester_user_id IS DISTINCT FROM p_requester_user_id
      OR v_existing_operation IS DISTINCT FROM v_operation
      OR v_existing_request_hash IS DISTINCT FROM v_request_hash
      OR v_existing_approval_request_id IS DISTINCT FROM v_approval_request_id THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different minecraft operation';
    END IF;

    RETURN QUERY SELECT
      v_existing_operation_id,
      v_existing_approval_request_id,
      v_existing_operation,
      v_existing_state,
      true;
    RETURN;
  END IF;

  INSERT INTO public.minecraft_approved_operation_events (
    operation_id,
    event_type,
    actor_user_id,
    metadata
  ) VALUES (
    v_existing_operation_id,
    'requested',
    p_requester_user_id,
    pg_catalog.jsonb_build_object(
      'approvalRequestId', v_approval_request_id::text,
      'operation', v_operation
    )
  );

  PERFORM public.admin_append_audit_event(
    p_requester_user_id,
    'minecraft.operation.requested',
    v_existing_operation_id,
    NULL,
    pg_catalog.jsonb_build_object(
      'approvalRequestId', v_approval_request_id::text,
      'operation', v_operation
    )
  );

  RETURN QUERY SELECT
    v_existing_operation_id,
    v_approval_request_id,
    v_operation,
    'pending_approval'::text,
    false;
END;
$$;

-- The only requester-visible operation lookup.  A wrong/missing operation ID
-- and an operation belonging to someone else both produce zero rows, and the
-- lease token, host details, and raw host-agent response are never returned.
CREATE OR REPLACE FUNCTION public.minecraft_get_my_approved_operation(
  p_requester_user_id uuid,
  p_operation_id uuid
)
RETURNS TABLE(
  operation_id uuid,
  approval_request_id uuid,
  operation text,
  state text,
  requested_at timestamptz,
  approved_at timestamptz,
  finished_at timestamptz,
  result_summary jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_requester_user_id IS NULL OR p_operation_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'operation identity is required';
  END IF;

  RETURN QUERY
  SELECT
    operation_row.id,
    operation_row.approval_request_id,
    operation_row.operation,
    operation_row.state,
    operation_row.created_at,
    operation_row.approved_at,
    operation_row.finished_at,
    operation_row.result_summary
  FROM public.minecraft_approved_operations AS operation_row
  JOIN public.users AS requester_row ON requester_row.id = operation_row.requester_user_id
  WHERE operation_row.id = p_operation_id
    AND operation_row.requester_user_id = p_requester_user_id
    AND requester_row.status = 'active'::public.user_status;
END;
$$;

-- Claiming is deliberately not granted to moneyverse_app.  A future
-- host-local executor must use a separately provisioned database role.  The
-- one-attempt policy prioritizes no duplicate host-side execution over an
-- automatic retry: an expired lease is terminal and needs a new request plus
-- a new independent approval.
CREATE OR REPLACE FUNCTION public.minecraft_claim_next_approved_operation(
  p_lease_token uuid,
  p_lease_seconds integer DEFAULT 30
)
RETURNS TABLE(
  operation_id uuid,
  operation text,
  lease_expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_operation_id uuid;
  v_operation text;
  v_lease_expires_at timestamptz;
  v_attempt_count integer;
BEGIN
  IF p_lease_token IS NULL
    OR p_lease_seconds IS NULL
    OR p_lease_seconds < 5
    OR p_lease_seconds > 120 THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'lease token and lease duration between 5 and 120 seconds are required';
  END IF;

  -- Do not recycle a possibly executed command when its worker died before
  -- recording completion.  The terminal state makes the ambiguity visible to
  -- operators while preserving at-most-once delivery from this queue.
  WITH expired AS (
    UPDATE public.minecraft_approved_operations AS operation_row
    SET state = 'lease_expired',
        finished_at = v_now,
        updated_at = v_now
    WHERE operation_row.state = 'leased'
      AND operation_row.lease_expires_at <= v_now
    RETURNING operation_row.id, operation_row.lease_attempt_count, operation_row.lease_expires_at
  )
  INSERT INTO public.minecraft_approved_operation_events (
    operation_id,
    event_type,
    actor_user_id,
    metadata,
    created_at
  )
  SELECT
    expired.id,
    'lease_expired',
    NULL,
    pg_catalog.jsonb_build_object(
      'leaseAttempt', expired.lease_attempt_count,
      'leaseExpiresAt', expired.lease_expires_at
    ),
    v_now
  FROM expired;

  SELECT operation_row.id, operation_row.operation
  INTO v_operation_id, v_operation
  FROM public.minecraft_approved_operations AS operation_row
  JOIN public.admin_approval_requests AS request_row
    ON request_row.id = operation_row.approval_request_id
  WHERE operation_row.state = 'approved'
    AND operation_row.lease_attempt_count = 0
    AND request_row.status = 'approved'
    AND request_row.action = 'minecraft.operation.' || operation_row.operation
    AND request_row.payload = pg_catalog.jsonb_build_object('operation', operation_row.operation)
  ORDER BY operation_row.approved_at ASC, operation_row.id ASC
  FOR UPDATE OF operation_row SKIP LOCKED
  LIMIT 1;

  IF v_operation_id IS NULL THEN
    RETURN;
  END IF;

  v_lease_expires_at := v_now + pg_catalog.make_interval(secs => p_lease_seconds);
  UPDATE public.minecraft_approved_operations AS operation_row
  SET state = 'leased',
      lease_token_hash = public.digest(p_lease_token::text, 'sha256'),
      lease_expires_at = v_lease_expires_at,
      lease_started_at = v_now,
      lease_attempt_count = 1,
      updated_at = v_now
  WHERE operation_row.id = v_operation_id
    AND operation_row.state = 'approved'
    AND operation_row.lease_attempt_count = 0
  RETURNING operation_row.lease_attempt_count INTO v_attempt_count;

  IF v_attempt_count IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION USING ERRCODE = '55000',
      MESSAGE = 'minecraft operation could not be leased';
  END IF;

  INSERT INTO public.minecraft_approved_operation_events (
    operation_id,
    event_type,
    actor_user_id,
    metadata,
    created_at
  ) VALUES (
    v_operation_id,
    'leased',
    NULL,
    pg_catalog.jsonb_build_object(
      'leaseAttempt', v_attempt_count,
      'leaseExpiresAt', v_lease_expires_at
    ),
    v_now
  );

  RETURN QUERY SELECT v_operation_id, v_operation, v_lease_expires_at;
END;
$$;

-- A leased record can be completed by only the same opaque lease token.  The
-- result is a small allow-listed summary, not raw logs/errors/responses, so it
-- cannot become a covert host, URL, command, or credential storage channel.
CREATE OR REPLACE FUNCTION public.minecraft_complete_approved_operation(
  p_operation_id uuid,
  p_lease_token uuid,
  p_outcome text,
  p_agent_request_id text,
  p_result_summary jsonb
)
RETURNS TABLE(
  operation_id uuid,
  state text,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_operation public.minecraft_approved_operations%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_outcome text;
  v_agent_request_id text;
  v_lease_token_hash bytea;
  v_allowed_keys text[] := ARRAY[
    'accepted',
    'state',
    'logLineCount',
    'logsTruncated',
    'responseDigest'
  ];
BEGIN
  v_outcome := p_outcome;
  v_agent_request_id := NULLIF(pg_catalog.btrim(coalesce(p_agent_request_id, '')), '');

  IF p_operation_id IS NULL OR p_lease_token IS NULL
    OR v_outcome NOT IN ('succeeded', 'failed') THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'operation, lease token, and fixed completion outcome are required';
  END IF;

  IF v_agent_request_id IS NOT NULL
    AND v_agent_request_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid host-agent request id';
  END IF;

  IF p_result_summary IS NULL
    OR pg_catalog.jsonb_typeof(p_result_summary) <> 'object'
    OR pg_catalog.octet_length(p_result_summary::text) > 4096
    OR EXISTS (
      SELECT 1
      FROM pg_catalog.jsonb_object_keys(p_result_summary) AS summary_key(key)
      WHERE summary_key.key <> ALL(v_allowed_keys)
    ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'result summary must use the fixed safe fields';
  END IF;

  IF (p_result_summary ? 'accepted'
      AND pg_catalog.jsonb_typeof(p_result_summary -> 'accepted') <> 'boolean')
    OR (p_result_summary ? 'state'
      AND (
        pg_catalog.jsonb_typeof(p_result_summary -> 'state') <> 'string'
        OR p_result_summary ->> 'state' NOT IN ('running', 'stopped', 'starting', 'stopping', 'unknown')
      ))
    OR (p_result_summary ? 'logLineCount'
      AND (
        pg_catalog.jsonb_typeof(p_result_summary -> 'logLineCount') <> 'number'
        OR p_result_summary ->> 'logLineCount' !~ '^(0|[1-9][0-9]{0,2})$'
      ))
    OR (p_result_summary ? 'logsTruncated'
      AND pg_catalog.jsonb_typeof(p_result_summary -> 'logsTruncated') <> 'boolean')
    OR (p_result_summary ? 'responseDigest'
      AND (
        pg_catalog.jsonb_typeof(p_result_summary -> 'responseDigest') <> 'string'
        OR p_result_summary ->> 'responseDigest' !~ '^[0-9a-f]{64}$'
      )) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid result summary value';
  END IF;

  SELECT operation_row.*
  INTO v_operation
  FROM public.minecraft_approved_operations AS operation_row
  WHERE operation_row.id = p_operation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'minecraft operation is unavailable';
  END IF;

  v_lease_token_hash := public.digest(p_lease_token::text, 'sha256');

  IF v_operation.state IN ('succeeded', 'failed') THEN
    IF v_operation.lease_token_hash = v_lease_token_hash
      AND v_operation.state = v_outcome
      AND v_operation.agent_request_id IS NOT DISTINCT FROM v_agent_request_id
      AND v_operation.result_summary IS NOT DISTINCT FROM p_result_summary THEN
      RETURN QUERY SELECT v_operation.id, v_operation.state, true;
      RETURN;
    END IF;

    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'minecraft operation is already terminal';
  END IF;

  IF v_operation.state = 'lease_expired' THEN
    IF v_operation.lease_token_hash = v_lease_token_hash THEN
      RETURN QUERY SELECT v_operation.id, v_operation.state, true;
      RETURN;
    END IF;
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'minecraft operation lease is unavailable';
  END IF;

  IF v_operation.state <> 'leased'
    OR v_operation.lease_token_hash IS DISTINCT FROM v_lease_token_hash THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'minecraft operation lease is unavailable';
  END IF;

  IF v_operation.lease_expires_at <= v_now THEN
    UPDATE public.minecraft_approved_operations AS operation_row
    SET state = 'lease_expired',
        finished_at = v_now,
        updated_at = v_now
    WHERE operation_row.id = v_operation.id;

    INSERT INTO public.minecraft_approved_operation_events (
      operation_id,
      event_type,
      actor_user_id,
      metadata,
      created_at
    ) VALUES (
      v_operation.id,
      'lease_expired',
      NULL,
      pg_catalog.jsonb_build_object(
        'leaseAttempt', v_operation.lease_attempt_count,
        'leaseExpiresAt', v_operation.lease_expires_at
      ),
      v_now
    );

    RETURN QUERY SELECT v_operation.id, 'lease_expired'::text, false;
    RETURN;
  END IF;

  -- A successful status result needs a normalized state; an action needs the
  -- fixed acceptance marker; a successful logs operation records only
  -- metadata/digest, never the raw log content.
  IF v_outcome = 'succeeded' AND (
    (v_operation.operation = 'status'
      AND NOT (p_result_summary ? 'state'))
    OR (v_operation.operation IN ('start', 'stop', 'restart')
      AND coalesce((p_result_summary ->> 'accepted')::boolean, false) IS NOT TRUE)
    OR (v_operation.operation = 'logs'
      AND NOT (p_result_summary ? 'logLineCount'))
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'successful minecraft result lacks required safe summary fields';
  END IF;

  IF (v_operation.operation = 'logs'
      AND (p_result_summary ? 'accepted' OR p_result_summary ? 'state'))
    OR (v_operation.operation <> 'logs'
      AND (p_result_summary ? 'logLineCount' OR p_result_summary ? 'logsTruncated')) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'result summary does not match the fixed minecraft operation';
  END IF;

  UPDATE public.minecraft_approved_operations AS operation_row
  SET state = v_outcome,
      agent_request_id = v_agent_request_id,
      result_summary = p_result_summary,
      finished_at = v_now,
      updated_at = v_now
  WHERE operation_row.id = v_operation.id;

  -- Generic approval status is consumed only after the durable operation has
  -- received a terminal receipt.  The operation state remains the source of
  -- truth for success/failure/lease-expiry detail.
  UPDATE public.admin_approval_requests AS request_row
  SET status = 'executed'
  WHERE request_row.id = v_operation.approval_request_id
    AND request_row.status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '55000',
      MESSAGE = 'minecraft approval could not be consumed';
  END IF;

  INSERT INTO public.minecraft_approved_operation_events (
    operation_id,
    event_type,
    actor_user_id,
    metadata,
    created_at
  ) VALUES (
    v_operation.id,
    v_outcome,
    NULL,
    pg_catalog.jsonb_build_object(
      'agentRequestIdPresent', v_agent_request_id IS NOT NULL,
      'leaseAttempt', v_operation.lease_attempt_count,
      'resultSummary', p_result_summary
    ),
    v_now
  );

  RETURN QUERY SELECT v_operation.id, v_outcome, false;
END;
$$;

ALTER TABLE public.minecraft_approved_operations OWNER TO moneyverse_migrator;
ALTER TABLE public.minecraft_approved_operation_events OWNER TO moneyverse_migrator;
ALTER FUNCTION public.minecraft_reject_approved_operation_event_mutation() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.minecraft_sync_approved_operation_from_approval() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.minecraft_request_approved_operation(uuid, text, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.minecraft_get_my_approved_operation(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.minecraft_claim_next_approved_operation(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.minecraft_complete_approved_operation(uuid, uuid, text, text, jsonb) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON TABLE public.minecraft_approved_operations,
  public.minecraft_approved_operation_events
  FROM PUBLIC, moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_reject_approved_operation_event_mutation()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_sync_approved_operation_from_approval()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_request_approved_operation(uuid, text, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_get_my_approved_operation(uuid, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_claim_next_approved_operation(uuid, integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.minecraft_complete_approved_operation(uuid, uuid, text, text, jsonb)
  FROM PUBLIC, moneyverse_app;

-- The shared web application can request and read only its session-scoped
-- record.  Claim/complete remain owner-only until a future host-local worker
-- receives a separately scoped database role and explicit grants.
GRANT EXECUTE ON FUNCTION public.minecraft_request_approved_operation(uuid, text, uuid)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.minecraft_get_my_approved_operation(uuid, uuid)
  TO moneyverse_app;

COMMIT;
