-- P0 #1656: bind NPC order idempotency to the original actor, NPC and command.
-- Forward-only: 082 is applied and must never be edited.
-- Stacked after the unmerged 288-290 migration series in PR #1658.
--
-- Existing engagement_progress_receipts do not identify the originating NPC.
-- They cannot safely be grandfathered into the new receipt table. An ambiguous
-- legacy key is rejected, rather than guessed to be an order.
BEGIN;

CREATE TABLE public.engagement_npc_order_receipts (
  idempotency_key uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id),
  npc_id uuid NOT NULL REFERENCES public.npc_profiles(id),
  npc_code text NOT NULL CHECK (npc_code ~ '^[a-z0-9_]{3,64}$'),
  command_type text NOT NULL DEFAULT 'npc_order' CHECK (command_type = 'npc_order'),
  accepted_affinity integer NOT NULL CHECK (accepted_affinity >= 1),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

ALTER TABLE public.engagement_npc_order_receipts OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON TABLE public.engagement_npc_order_receipts FROM PUBLIC, moneyverse_app;

-- Even the table owner must not silently rewrite the accepted outcome.
CREATE OR REPLACE FUNCTION public.engagement_npc_receipt_immutable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'NPC order receipt is immutable';
END;
$$;

ALTER FUNCTION public.engagement_npc_receipt_immutable() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.engagement_npc_receipt_immutable() FROM PUBLIC, moneyverse_app;

CREATE TRIGGER engagement_npc_receipt_immutable
BEFORE UPDATE OR DELETE ON public.engagement_npc_order_receipts
FOR EACH ROW EXECUTE FUNCTION public.engagement_npc_receipt_immutable();

CREATE OR REPLACE FUNCTION public.engagement_record_npc_order(
  p_key uuid,
  p_actor uuid,
  p_npc_code text
)
RETURNS TABLE(npc_code text, affinity integer, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_npc uuid;
  v_receipt public.engagement_npc_order_receipts%ROWTYPE;
  v_progress_replayed boolean;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_npc_code IS NULL
    OR p_npc_code !~ '^[a-z0-9_]{3,64}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid NPC order';
  END IF;

  -- Serialize every order/replay using the same key, before looking up receipts.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:engagement-npc:' || p_key::text, 0)
  );

  -- An inactive account must not retrieve old private relationship outcomes.
  PERFORM 1 FROM public.users AS member_row
  WHERE member_row.id = p_actor AND member_row.status = 'active'::public.user_status
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  SELECT receipt_row.* INTO v_receipt
  FROM public.engagement_npc_order_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_receipt.user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'NPC order receipt belongs to another user';
    END IF;
    IF v_receipt.npc_code IS DISTINCT FROM p_npc_code
       OR v_receipt.command_type IS DISTINCT FROM 'npc_order' THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'NPC order idempotency key conflicts';
    END IF;

    -- The accepted result, not a later affinity total, is the replay receipt.
    npc_code := v_receipt.npc_code;
    affinity := v_receipt.accepted_affinity;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  -- A generic 082 receipt cannot prove which NPC (if any) originated the key.
  -- Never manufacture a new NPC receipt from a legacy progress receipt.
  IF EXISTS (
    SELECT 1 FROM public.engagement_progress_receipts AS progress_receipt
    WHERE progress_receipt.idempotency_key = p_key
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '55000',
      MESSAGE = 'legacy engagement receipt has no NPC provenance';
  END IF;

  -- FOR SHARE blocks UPDATE active=false until this transaction commits.
  -- FOR KEY SHARE is insufficient because active is a non-key column.
  SELECT profile_row.id INTO v_npc
  FROM public.npc_profiles AS profile_row
  WHERE profile_row.code = p_npc_code AND profile_row.active
  FOR SHARE;

  IF v_npc IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown or inactive NPC';
  END IF;

  -- The generic progress writer takes its own per-key lock and inserts the
  -- progress receipt. A competing generic command can win that lock; if so,
  -- abort rather than awarding affinity for a replay of unrelated progress.
  SELECT recorded.replayed INTO v_progress_replayed
  FROM public.engagement_record_progress(p_key, p_actor, 'neighbour_help', 1) AS recorded;
  IF v_progress_replayed IS DISTINCT FROM false THEN
    RAISE EXCEPTION USING ERRCODE = '55000',
      MESSAGE = 'NPC order key already used by engagement progress';
  END IF;

  INSERT INTO public.npc_relationships AS relationship_row (user_id, npc_id, affinity)
  VALUES (p_actor, v_npc, 1)
  ON CONFLICT (user_id, npc_id) DO UPDATE
    SET affinity = relationship_row.affinity + 1
  RETURNING relationship_row.affinity INTO affinity;

  INSERT INTO public.engagement_npc_order_receipts (
    idempotency_key, user_id, npc_id, npc_code, command_type, accepted_affinity
  ) VALUES (p_key, p_actor, v_npc, p_npc_code, 'npc_order', affinity);

  npc_code := p_npc_code;
  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.engagement_record_npc_order(uuid, uuid, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.engagement_record_npc_order(uuid, uuid, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.engagement_record_npc_order(uuid, uuid, text) TO moneyverse_app;

COMMIT;
