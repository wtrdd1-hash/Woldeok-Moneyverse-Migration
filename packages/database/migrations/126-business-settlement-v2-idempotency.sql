-- 126-business-settlement-v2-idempotency.sql
-- Update version: 2026.09.12-02
--
-- business_settle_daily_v2 was introduced after the repository's idempotency
-- template had already been established, but it did not copy the template:
-- it read the receipt before taking a key-scoped advisory lock, and a replay
-- returned the receipt without verifying that its ownership belongs to the
-- caller. V1 was corrected for exactly those two properties in migration 085.
--
-- 115 also used the unqualified names `ownership_id` and `settlement_date` in
-- its daily duplicate check even though RETURNS TABLE declares OUT parameters
-- with those same names. PL/pgSQL can therefore raise 42702 for that path.
--
-- This migration repairs those invariants only. The V2 boost calculation,
-- daily-settlement rule, ledger postings and event payload remain unchanged.

BEGIN;

CREATE OR REPLACE FUNCTION public.business_settle_daily_v2(
  p_actor uuid,
  p_ownership_id uuid,
  p_idempotency_key uuid
)
RETURNS TABLE(
  ownership_id uuid,
  settlement_date date,
  gross_revenue bigint,
  operating_cost bigint,
  net_amount bigint,
  transaction_id uuid,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_ownership record;
  v_date date;
  v_gross bigint;
  v_cost bigint;
  v_cash uuid;
  v_mint uuid;
  v_sink uuid;
  v_tx_id uuid;
  v_rev_mult numeric := 1.0;
  v_cost_mult numeric := 1.0;
  v_boost jsonb;
  v_receipt_owner uuid;
BEGIN
  -- Repository idempotency template: validate, lock KEY, replay, owner check,
  -- then perform the real work. Do not move the replay lookup above this lock.
  IF p_actor IS NULL OR p_ownership_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business settlement identity is required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'moneyverse:business_settle_daily_v2:' || p_idempotency_key::text,
      0
    )
  );

  SELECT settlement_row.ownership_id,
         settlement_row.settlement_date,
         settlement_row.gross_revenue,
         settlement_row.operating_cost,
         settlement_row.net_amount,
         settlement_row.transaction_id,
         owner_row.user_id
  INTO ownership_id,
       settlement_date,
       gross_revenue,
       operating_cost,
       net_amount,
       transaction_id,
       v_receipt_owner
  FROM public.virtual_business_settlements AS settlement_row
  JOIN public.virtual_business_ownerships AS owner_row
    ON owner_row.id = settlement_row.ownership_id
  WHERE settlement_row.idempotency_key = p_idempotency_key;

  IF FOUND THEN
    IF v_receipt_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'settlement receipt belongs to another user';
    END IF;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Verify ownership and lock it for the settlement calculation.
  SELECT bo.*, bt.symbol, bt.name, bt.daily_revenue, bt.daily_operating_cost
  INTO v_ownership
  FROM public.virtual_business_ownerships AS bo
  JOIN public.virtual_business_types AS bt ON bt.id = bo.business_type_id
  WHERE bo.id = p_ownership_id AND bo.user_id = p_actor
  FOR UPDATE OF bo, bt;

  IF v_ownership IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business ownership not found';
  END IF;

  v_date := (pg_catalog.now() AT TIME ZONE 'Asia/Seoul')::date;

  IF EXISTS (
    SELECT 1
    FROM public.virtual_business_settlements AS settlement_row
    WHERE settlement_row.ownership_id = p_ownership_id
      AND settlement_row.settlement_date = v_date
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business already settled today';
  END IF;

  v_boost := v_ownership.boost_active;
  IF v_boost IS NOT NULL AND v_boost ? 'expires_at' THEN
    IF (v_boost->>'expires_at')::timestamptz > pg_catalog.clock_timestamp() THEN
      v_rev_mult := pg_catalog.coalesce((v_boost->>'revenue_mult')::numeric, 1.0);
      v_cost_mult := pg_catalog.coalesce((v_boost->>'cost_mult')::numeric, 1.0);
    END IF;
  END IF;

  v_gross := pg_catalog.round(v_ownership.daily_revenue * v_rev_mult);
  v_cost := pg_catalog.round(v_ownership.daily_operating_cost * v_cost_mult);

  SELECT account_row.id INTO v_cash
  FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_mint
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'mint'
    AND account_row.account_type = 'MINT'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_sink
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink'
    AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_mint IS NULL OR v_sink IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash, mint or sink account required';
  END IF;

  SELECT public.economy_post_transaction(
    p_idempotency_key,
    'BUSINESS_SETTLEMENT',
    p_actor,
    NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_gross, 'direction', 'debit'),
      pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', v_gross, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_cost, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_sink, 'amount', v_cost, 'direction', 'debit')
    ),
    'business.daily_settled_v2',
    pg_catalog.jsonb_build_object(
      'ownershipId', p_ownership_id,
      'grossRevenue', v_gross,
      'operatingCost', v_cost
    )
  ) INTO v_tx_id;

  INSERT INTO public.virtual_business_settlements (
    ownership_id,
    settlement_date,
    idempotency_key,
    gross_revenue,
    operating_cost,
    net_amount,
    transaction_id
  ) VALUES (
    p_ownership_id,
    v_date,
    p_idempotency_key,
    v_gross,
    v_cost,
    v_gross - v_cost,
    v_tx_id
  );

  RETURN QUERY
  SELECT p_ownership_id, v_date, v_gross, v_cost, v_gross - v_cost, v_tx_id, false;
END;
$$;

ALTER FUNCTION public.business_settle_daily_v2(uuid, uuid, uuid)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.business_settle_daily_v2(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.business_settle_daily_v2(uuid, uuid, uuid)
  TO moneyverse_app;

COMMIT;
