-- 206-economic-command-envelope.sql
-- Update version: v2026.09.19.239
-- P0 ECON-233-02 foundation: one immutable command identity for economic writes.
-- Existing economic procedures are intentionally not rewritten here; subsequent
-- forward migrations can adopt this envelope without changing applied history.

BEGIN;

CREATE TABLE public.economic_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES public.users(id),
  action text NOT NULL CHECK (action ~ '^[a-z][a-z0-9_.:-]{1,95}$'),
  resource_id text NOT NULL CHECK (length(resource_id) BETWEEN 1 AND 160),
  idempotency_key uuid NOT NULL,
  request_hash bytea NOT NULL CHECK (octet_length(request_hash) = 32),
  client_request_id text CHECK (client_request_id IS NULL OR length(client_request_id) BETWEEN 1 AND 160),
  ledger_transaction_id uuid REFERENCES public.ledger_transactions(id),
  result_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  completed_at timestamptz,
  CONSTRAINT economic_commands_actor_action_key UNIQUE (actor_id, action, idempotency_key),
  CONSTRAINT economic_commands_completion_shape CHECK (
    (completed_at IS NULL AND result_snapshot IS NULL AND ledger_transaction_id IS NULL)
    OR
    (completed_at IS NOT NULL AND result_snapshot IS NOT NULL)
  )
);

CREATE INDEX economic_commands_created_at_idx
  ON public.economic_commands (created_at DESC);
CREATE INDEX economic_commands_ledger_transaction_idx
  ON public.economic_commands (ledger_transaction_id)
  WHERE ledger_transaction_id IS NOT NULL;

-- Browser/application callers may inspect their command receipts only through
-- SECURITY DEFINER APIs added by adopting command paths. They cannot forge,
-- mutate, or delete command identities directly.
REVOKE ALL PRIVILEGES ON TABLE public.economic_commands FROM PUBLIC, moneyverse_app;

-- Prevent accidental historical rewrites even by ordinary table writers. The
-- owner may only move an in-flight command to its terminal snapshot once.
CREATE OR REPLACE FUNCTION public.economic_command_immutability_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'economic commands are immutable' USING ERRCODE = '55000';
  END IF;

  IF OLD.actor_id IS DISTINCT FROM NEW.actor_id
     OR OLD.action IS DISTINCT FROM NEW.action
     OR OLD.resource_id IS DISTINCT FROM NEW.resource_id
     OR OLD.idempotency_key IS DISTINCT FROM NEW.idempotency_key
     OR OLD.request_hash IS DISTINCT FROM NEW.request_hash
     OR OLD.client_request_id IS DISTINCT FROM NEW.client_request_id
     OR OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'economic command identity is immutable' USING ERRCODE = '55000';
  END IF;

  IF OLD.completed_at IS NOT NULL THEN
    RAISE EXCEPTION 'completed economic command is immutable' USING ERRCODE = '55000';
  END IF;

  IF NEW.completed_at IS NULL OR NEW.result_snapshot IS NULL THEN
    RAISE EXCEPTION 'economic command update must atomically complete the command' USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.economic_command_immutability_guard() FROM PUBLIC, moneyverse_app;

CREATE TRIGGER economic_commands_immutable
BEFORE UPDATE OR DELETE ON public.economic_commands
FOR EACH ROW EXECUTE FUNCTION public.economic_command_immutability_guard();

COMMIT;
