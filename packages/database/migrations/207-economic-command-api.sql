-- 207-economic-command-api.sql
-- Update version: v2026.09.19.240
-- P0 ECON-233-02: transactional claim/complete API for the common economic command envelope.
-- Callers must claim and complete in the same transaction as their ledger mutation.

BEGIN;

CREATE OR REPLACE FUNCTION public.economic_command_claim(
  p_actor uuid,
  p_action text,
  p_resource_id text,
  p_key uuid,
  p_request_hash bytea,
  p_client_request_id text DEFAULT NULL
)
RETURNS TABLE(command_id uuid, replayed boolean, ledger_transaction_id uuid, result_snapshot jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_row public.economic_commands%ROWTYPE;
BEGIN
  IF p_actor IS NULL OR p_action IS NULL OR p_resource_id IS NULL OR p_key IS NULL OR p_request_hash IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'economic command identity is required';
  END IF;
  IF p_action !~ '^[a-z][a-z0-9_.:-]{1,95}$' OR length(p_resource_id) NOT BETWEEN 1 AND 160
     OR octet_length(p_request_hash) <> 32
     OR (p_client_request_id IS NOT NULL AND length(p_client_request_id) NOT BETWEEN 1 AND 160) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid economic command identity';
  END IF;

  -- Serialize the identity before inspecting/inserting it. This prevents two
  -- concurrent first attempts from both performing the downstream mutation.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_actor::text || ':' || p_action || ':' || p_key::text, 0)
  );

  SELECT command_row.* INTO v_row
  FROM public.economic_commands AS command_row
  WHERE command_row.actor_id = p_actor
    AND command_row.action = p_action
    AND command_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_row.request_hash IS DISTINCT FROM p_request_hash
       OR v_row.resource_id IS DISTINCT FROM p_resource_id
       OR v_row.client_request_id IS DISTINCT FROM p_client_request_id THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key was already used for a different request';
    END IF;
    IF v_row.completed_at IS NULL THEN
      -- Under the advisory xact lock this can only be historical/incomplete
      -- state from a separately committed transaction. Fail closed: callers
      -- must not repeat a possibly-applied economic mutation.
      RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'economic command is incomplete; reconciliation required';
    END IF;
    RETURN QUERY SELECT v_row.id, true, v_row.ledger_transaction_id, v_row.result_snapshot;
    RETURN;
  END IF;

  INSERT INTO public.economic_commands (
    actor_id, action, resource_id, idempotency_key, request_hash, client_request_id
  ) VALUES (p_actor, p_action, p_resource_id, p_key, p_request_hash, p_client_request_id)
  RETURNING id INTO command_id;

  replayed := false;
  ledger_transaction_id := NULL;
  result_snapshot := NULL;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.economic_command_complete(
  p_command uuid,
  p_ledger_transaction uuid,
  p_result jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_completed timestamptz;
BEGIN
  IF p_command IS NULL OR p_result IS NULL OR pg_catalog.jsonb_typeof(p_result) <> 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'command and object result are required';
  END IF;

  SELECT command_row.completed_at INTO v_completed
  FROM public.economic_commands AS command_row
  WHERE command_row.id = p_command
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'economic command does not exist';
  END IF;
  IF v_completed IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'economic command is already complete';
  END IF;

  UPDATE public.economic_commands AS command_row
  SET ledger_transaction_id = p_ledger_transaction,
      result_snapshot = p_result,
      completed_at = pg_catalog.clock_timestamp()
  WHERE command_row.id = p_command;
END;
$$;

ALTER FUNCTION public.economic_command_claim(uuid, text, text, uuid, bytea, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economic_command_complete(uuid, uuid, jsonb) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.economic_command_claim(uuid, text, text, uuid, bytea, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.economic_command_complete(uuid, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.economic_command_claim(uuid, text, text, uuid, bytea, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economic_command_complete(uuid, uuid, jsonb) TO moneyverse_app;

COMMIT;
