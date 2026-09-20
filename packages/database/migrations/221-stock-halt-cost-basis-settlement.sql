-- Migration: 221-stock-halt-cost-basis-settlement.sql
-- Implements STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC.ko.md (v2026.09.21.315)
-- Authoritative server-side cost-basis auto-settlement for halted stocks.

ALTER TABLE public.virtual_stocks
  ADD COLUMN IF NOT EXISTS halt_status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (halt_status IN ('ACTIVE', 'HALTING', 'HALTED_SETTLING', 'HALTED_SETTLED')),
  ADD COLUMN IF NOT EXISTS halted_at timestamptz NULL;

CREATE TABLE IF NOT EXISTS public.virtual_stock_halt_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  halt_event_id uuid NOT NULL,
  stock_id uuid NOT NULL,
  stock_symbol text NOT NULL,
  stock_name text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id),
  account_id uuid NOT NULL,
  quantity bigint NOT NULL CHECK (quantity >= 0),
  basis_method text NOT NULL DEFAULT 'average_cost',
  basis_unit_amount bigint NOT NULL CHECK (basis_unit_amount >= 0),
  refund_amount bigint NOT NULL CHECK (refund_amount >= 0),
  ledger_entry_id uuid NULL,
  command_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'settled' CHECK (status IN ('settling', 'settled', 'quarantined')),
  error_message text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  source_version text NOT NULL DEFAULT 'v2026.09.21.315'
);

CREATE INDEX IF NOT EXISTS virtual_stock_halt_settlements_stock_idx
  ON public.virtual_stock_halt_settlements(stock_id, created_at DESC);

CREATE INDEX IF NOT EXISTS virtual_stock_halt_settlements_user_idx
  ON public.virtual_stock_halt_settlements(user_id, created_at DESC);

-- Authoritative stock halt and cost-basis settlement function
CREATE OR REPLACE FUNCTION public.stock_halt_and_settle(
  p_actor uuid,
  p_stock uuid,
  p_halt_event_id uuid DEFAULT gen_random_uuid()
)
RETURNS TABLE(
  settled_count bigint,
  total_refund_amount bigint,
  quarantined_count bigint,
  halt_status text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_id uuid;
  v_symbol text;
  v_name text;
  v_current_status text;
  v_sink uuid;
  v_settled_cnt bigint := 0;
  v_total_refund bigint := 0;
  v_quarantine_cnt bigint := 0;
  r_pos RECORD;
  v_refund bigint;
  v_cmd uuid;
  v_event_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role='operator'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='operator role required';
  END IF;

  SELECT id, symbol, name, halt_status
  INTO v_id, v_symbol, v_name, v_current_status
  FROM public.virtual_stocks
  WHERE id = p_stock
  FOR UPDATE;

  IF v_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='stock not found';
  END IF;

  v_event_id := coalesce(p_halt_event_id, gen_random_uuid());

  -- If already completely settled, return existing totals idempotently
  IF v_current_status = 'HALTED_SETTLED' THEN
    SELECT count(*)::bigint, coalesce(sum(refund_amount), 0)::bigint
    INTO v_settled_cnt, v_total_refund
    FROM public.virtual_stock_halt_settlements
    WHERE stock_id = p_stock AND status = 'settled';

    RETURN QUERY SELECT v_settled_cnt, v_total_refund, 0::bigint, 'HALTED_SETTLED'::text;
    RETURN;
  END IF;

  -- Transition status to HALTING -> HALTED_SETTLING
  UPDATE public.virtual_stocks
  SET halt_status = 'HALTED_SETTLING', active = false, halted_at = coalesce(halted_at, now()), updated_at = now()
  WHERE id = p_stock;

  SELECT id INTO v_sink
  FROM public.accounts
  WHERE system_key = 'sink' AND account_type = 'SINK'::public.account_type AND status = 'active'::public.account_status
  FOR UPDATE;

  IF v_sink IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active sink account required';
  END IF;

  -- Iterate each holding in deterministic order
  FOR r_pos IN
    SELECT p.user_id, p.quantity, p.average_cost, a.id AS cash_account_id
    FROM public.virtual_stock_positions p
    JOIN public.accounts a
      ON a.owner_user_id = p.user_id
     AND a.account_type = 'USER_CASH'::public.account_type
     AND a.status = 'active'::public.account_status
    WHERE p.stock_id = p_stock AND p.quantity > 0
    ORDER BY p.user_id ASC
    FOR UPDATE OF p
  LOOP
    -- Idempotency check: only refund if not already recorded for this stock and user
    IF NOT EXISTS (
      SELECT 1 FROM public.virtual_stock_halt_settlements
      WHERE stock_id = p_stock AND user_id = r_pos.user_id AND status = 'settled'
    ) THEN
      v_refund := r_pos.quantity * r_pos.average_cost;
      v_cmd := gen_random_uuid();

      -- Fail-closed validation for missing or corrupt cost basis
      IF r_pos.average_cost IS NULL OR r_pos.average_cost <= 0 THEN
        INSERT INTO public.virtual_stock_halt_settlements(
          halt_event_id, stock_id, stock_symbol, stock_name, user_id, account_id,
          quantity, basis_method, basis_unit_amount, refund_amount, command_id, status, error_message
        ) VALUES (
          v_event_id, p_stock, v_symbol, v_name, r_pos.user_id, r_pos.cash_account_id,
          r_pos.quantity, 'average_cost', 0, 0, v_cmd, 'quarantined', 'missing or invalid cost basis'
        );
        v_quarantine_cnt := v_quarantine_cnt + 1;
      ELSE
        -- Atomic WLD refund posting
        IF v_refund > 0 THEN
          PERFORM public.economy_post_transaction(
            v_cmd,
            'VIRTUAL_STOCK_HALT_REFUND',
            r_pos.user_id,
            NULL,
            jsonb_build_array(
              jsonb_build_object('accountId', r_pos.cash_account_id, 'amount', v_refund, 'direction', 'debit'),
              jsonb_build_object('accountId', v_sink, 'amount', v_refund, 'direction', 'credit')
            ),
            'stock.halt.settlement.completed',
            jsonb_build_object(
              'stockId', p_stock,
              'symbol', v_symbol,
              'quantity', r_pos.quantity,
              'costBasis', r_pos.average_cost,
              'refundAmount', v_refund
            )
          );
        END IF;

        -- Zero out holding
        UPDATE public.virtual_stock_positions
        SET quantity = 0, updated_at = now()
        WHERE user_id = r_pos.user_id AND stock_id = p_stock;

        -- Record settlement receipt
        INSERT INTO public.virtual_stock_halt_settlements(
          halt_event_id, stock_id, stock_symbol, stock_name, user_id, account_id,
          quantity, basis_method, basis_unit_amount, refund_amount, command_id, status
        ) VALUES (
          v_event_id, p_stock, v_symbol, v_name, r_pos.user_id, r_pos.cash_account_id,
          r_pos.quantity, 'average_cost', r_pos.average_cost, v_refund, v_cmd, 'settled'
        );

        v_settled_cnt := v_settled_cnt + 1;
        v_total_refund := v_total_refund + v_refund;
      END IF;
    END IF;
  END LOOP;

  -- Only transition to HALTED_SETTLED if no unhandled holdings remain
  IF v_quarantine_cnt = 0 THEN
    UPDATE public.virtual_stocks
    SET halt_status = 'HALTED_SETTLED', updated_at = now()
    WHERE id = p_stock;
    v_current_status := 'HALTED_SETTLED';
  ELSE
    v_current_status := 'HALTED_SETTLING';
  END IF;

  RETURN QUERY SELECT v_settled_cnt, v_total_refund, v_quarantine_cnt, v_current_status;
END;
$$;

-- Query halt settlement summary and receipts
CREATE OR REPLACE FUNCTION public.stock_halt_settlement_status(
  p_actor uuid,
  p_stock uuid
)
RETURNS TABLE(
  stock_id uuid,
  symbol text,
  name text,
  halt_status text,
  halted_at timestamptz,
  settled_count bigint,
  total_refund_amount bigint,
  quarantined_count bigint,
  pending_holdings_count bigint
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_stock RECORD;
  v_settled bigint := 0;
  v_refund bigint := 0;
  v_quarantine bigint := 0;
  v_pending bigint := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role='operator'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='operator role required';
  END IF;

  SELECT id, public.virtual_stocks.symbol, public.virtual_stocks.name, public.virtual_stocks.halt_status, public.virtual_stocks.halted_at
  INTO v_stock
  FROM public.virtual_stocks
  WHERE id = p_stock;

  IF v_stock.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='stock not found';
  END IF;

  SELECT count(*)::bigint, coalesce(sum(refund_amount), 0)::bigint
  INTO v_settled, v_refund
  FROM public.virtual_stock_halt_settlements
  WHERE public.virtual_stock_halt_settlements.stock_id = p_stock AND status = 'settled';

  SELECT count(*)::bigint
  INTO v_quarantine
  FROM public.virtual_stock_halt_settlements
  WHERE public.virtual_stock_halt_settlements.stock_id = p_stock AND status = 'quarantined';

  SELECT count(*)::bigint
  INTO v_pending
  FROM public.virtual_stock_positions
  WHERE public.virtual_stock_positions.stock_id = p_stock AND quantity > 0;

  RETURN QUERY SELECT
    v_stock.id,
    v_stock.symbol,
    v_stock.name,
    v_stock.halt_status,
    v_stock.halted_at,
    v_settled,
    v_refund,
    v_quarantine,
    v_pending;
END;
$$;

-- Enhanced stock_admin_delete with settlement gate (protecting financial ledger from cascade deletion)
CREATE OR REPLACE FUNCTION public.stock_admin_delete(p_key uuid, p_actor uuid, p_stock uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_pending bigint := 0;
  v_halt_status text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role='operator'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='operator role required';
  END IF;

  SELECT halt_status INTO v_halt_status FROM public.virtual_stocks WHERE id = p_stock FOR UPDATE;
  IF v_halt_status IS NULL THEN
    RETURN false;
  END IF;

  -- Block deletion if there are still unsettled active holdings
  SELECT count(*) INTO v_pending
  FROM public.virtual_stock_positions
  WHERE stock_id = p_stock AND quantity > 0;

  IF v_pending > 0 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='cannot delete stock with active holdings: settlement required';
  END IF;

  -- If the stock was traded or halted, ensure settlements and ledger remain immutable
  -- Clean up transient watchlist, alerts, daily/minute candles, and then remove stock catalog entry
  DELETE FROM public.member_stock_watchlist WHERE stock_id = p_stock;
  DELETE FROM public.member_stock_alert_rules WHERE stock_id = p_stock;
  DELETE FROM public.virtual_stock_positions WHERE stock_id = p_stock AND quantity = 0;
  DELETE FROM public.virtual_stocks WHERE id = p_stock;

  RETURN true;
END;
$$;

-- Grant permissions to application role
GRANT SELECT ON public.virtual_stock_halt_settlements TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.stock_halt_and_settle(uuid, uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.stock_halt_settlement_status(uuid, uuid) TO moneyverse_app;
