-- 280: SOE remittance is one PostgreSQL transaction, not three independent app writes.
-- This new migration deliberately does not modify any previously applied migration.
BEGIN;

CREATE TABLE public.soe_dividend_harvest_receipts (
  idempotency_key uuid PRIMARY KEY,
  actor_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  period_started_at timestamptz NOT NULL UNIQUE,
  result jsonb NOT NULL CHECK (jsonb_typeof(result) = 'object'),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

REVOKE ALL PRIVILEGES ON TABLE public.soe_dividend_harvest_receipts FROM PUBLIC, moneyverse_app;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.state_enterprise_dividend_logs FROM moneyverse_app;

CREATE FUNCTION public.admin_harvest_soe_dividends(
  p_actor uuid,
  p_key uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  v_period timestamptz := pg_catalog.date_trunc('hour', pg_catalog.transaction_timestamp());
  v_existing public.soe_dividend_harvest_receipts%ROWTYPE;
  v_vault_id uuid;
  v_balance numeric;
  v_before numeric;
  v_dividend numeric;
  v_total numeric := 0;
  v_count integer := 0;
  v_ledger_id uuid;
  v_soe record;
  v_result jsonb;
BEGIN
  IF p_actor IS NULL OR p_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor and idempotency key are required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:soe_dividend:' || p_key::text, 0)
  );

  SELECT * INTO v_existing
  FROM public.soe_dividend_harvest_receipts
  WHERE idempotency_key = p_key;

  IF FOUND AND v_existing.actor_user_id <> p_actor THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'remittance receipt belongs to another actor';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active administrator role required';
  END IF;

  IF v_existing.idempotency_key IS NOT NULL THEN
    RETURN v_existing.result;
  END IF;

  -- Vault row lock serializes distinct keys; the hourly unique constraint
  -- prevents two operators from paying the same accrued hour twice.
  SELECT id, balance_wld::numeric INTO v_vault_id, v_balance
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'main treasury vault unavailable';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.soe_dividend_harvest_receipts
    WHERE period_started_at = v_period
  ) OR EXISTS (
    SELECT 1 FROM public.state_enterprise_dividend_logs
    WHERE created_at >= v_period AND created_at < v_period + interval '1 hour'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'SOE dividends already harvested this hour';
  END IF;

  -- The vault is locked before the enterprises; enterprise row locks are
  -- acquired in id order so concurrent status/rate changes cannot race payout.
  FOR v_soe IN
    SELECT e.id, e.name, e.operating_revenue_hourly_wld, e.net_profit_hourly_wld,
           e.dividend_rate_bps, e.eval_grade
    FROM public.state_enterprises AS e
    WHERE e.status = 'ACTIVE'
    ORDER BY e.id
    FOR UPDATE OF e
  LOOP
    IF v_soe.dividend_rate_bps NOT BETWEEN 0 AND 10000 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'SOE dividend rate out of range';
    END IF;

    IF v_soe.net_profit_hourly_wld <= 0 THEN
      CONTINUE;
    END IF;

    v_dividend := pg_catalog.trunc(v_soe.net_profit_hourly_wld * v_soe.dividend_rate_bps / 10000);
    IF v_dividend <= 0 THEN
      CONTINUE;
    END IF;

    v_before := v_balance;
    v_balance := v_balance + v_dividend;
    v_total := v_total + v_dividend;
    v_count := v_count + 1;

    INSERT INTO public.system_treasury_ledger (
      vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
    ) VALUES (
      v_vault_id, 'FEE_RECIRCULATION', v_dividend::text, p_actor,
      '[SOE dividend remittance] ' || v_soe.name || ' (' || v_soe.eval_grade || ')',
      v_before::text, v_balance::text
    ) RETURNING id INTO v_ledger_id;

    INSERT INTO public.state_enterprise_dividend_logs (
      enterprise_id, dividend_amount_wld, revenue_wld, net_profit_wld, eval_grade, ledger_tx_id
    ) VALUES (
      v_soe.id, v_dividend, v_soe.operating_revenue_hourly_wld,
      v_soe.net_profit_hourly_wld, v_soe.eval_grade, v_ledger_id
    );
  END LOOP;

  IF v_total > 0 THEN
    UPDATE public.system_treasury_vaults
    SET balance_wld = v_balance::text, updated_at = pg_catalog.clock_timestamp()
    WHERE id = v_vault_id;
  END IF;

  v_result := pg_catalog.jsonb_build_object(
    'total_dividends_collected', v_total::text,
    'enterprises_processed', v_count,
    'treasury_balance_after', v_balance::text
  );

  INSERT INTO public.soe_dividend_harvest_receipts (
    idempotency_key, actor_user_id, period_started_at, result
  ) VALUES (p_key, p_actor, v_period, v_result);

  RETURN v_result;
END;
$function$;

ALTER FUNCTION public.admin_harvest_soe_dividends(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_harvest_soe_dividends(uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_harvest_soe_dividends(uuid, uuid) TO moneyverse_app;

COMMIT;
