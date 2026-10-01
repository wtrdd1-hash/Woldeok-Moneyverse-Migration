-- Migration 242: Progressive Wealth Tax & Whale Redistribution System
-- Implements Thomas Piketty tiered wealth tax on ultra-high net worth accounts
-- and directly redirects proceeds to VAULT_WELFARE.

BEGIN;

-- 1. Extend treasury ledger tx_type enum if needed
ALTER TABLE public.system_treasury_ledger
  DROP CONSTRAINT IF EXISTS system_treasury_ledger_tx_type_check;

ALTER TABLE public.system_treasury_ledger
  ADD CONSTRAINT system_treasury_ledger_tx_type_check CHECK (
    tx_type IN (
      'INJECTION',
      'ABSORPTION_SINK',
      'STOCK_HALT_SETTLEMENT',
      'FEE_RECIRCULATION',
      'CITIZEN_DIVIDEND',
      'COMMUNITY_FUNDING',
      'WELFARE_SUBSIDY',
      'MARKET_STIMULUS',
      'PUBLIC_GRANT',
      'BUDGET_DISTRIBUTION',
      'MARKET_BUYBACK_BURN',
      'CASINO_PIGOVIAN_TAX',
      'STOCK_SPECULATION_TAX',
      'WEALTH_TAX_COLLECTION'
    )
  );

-- 2. Wealth Tax Assessments Table
CREATE TABLE IF NOT EXISTS public.treasury_wealth_tax_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  assessed_date date NOT NULL DEFAULT CURRENT_DATE,
  total_wealth_wld numeric NOT NULL,
  exempt_amount_wld numeric NOT NULL DEFAULT 10000,
  taxable_excess_wld numeric NOT NULL,
  tax_amount_wld numeric NOT NULL,
  effective_rate_bps integer NOT NULL,
  admin_id uuid REFERENCES public.users(id),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_wealth_tax_user ON public.treasury_wealth_tax_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_wealth_tax_date ON public.treasury_wealth_tax_assessments(assessed_date);

-- 3. Progressive Wealth Tax Calculation Function
-- Tier 1: <= 10,000 WLD -> 0% (Exempt)
-- Tier 2: 10,001 ~ 30,000 WLD -> 2%
-- Tier 3: 30,001 ~ 60,000 WLD -> 5%
-- Tier 4: > 60,000 WLD -> 8%
CREATE OR REPLACE FUNCTION public.calculate_progressive_wealth_tax(p_total_wealth numeric)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_tax numeric := 0;
  v_excess numeric := 0;
  v_effective_bps integer := 0;
BEGIN
  IF p_total_wealth <= 10000 THEN
    RETURN jsonb_build_object(
      'total_wealth', p_total_wealth,
      'taxable_excess', 0,
      'tax_amount', 0,
      'effective_rate_bps', 0
    );
  END IF;

  v_excess := p_total_wealth - 10000;

  -- Tier 2: 10,001 to 30,000 (Max 20,000 * 2% = 400)
  IF p_total_wealth <= 30000 THEN
    v_tax := floor((p_total_wealth - 10000) * 0.02);
  -- Tier 3: 30,001 to 60,000 (400 + excess * 5%)
  ELSIF p_total_wealth <= 60000 THEN
    v_tax := 400 + floor((p_total_wealth - 30000) * 0.05);
  -- Tier 4: > 60,000 (400 + 1500 + excess * 8%)
  ELSE
    v_tax := 400 + 1500 + floor((p_total_wealth - 60000) * 0.08);
  END IF;

  IF p_total_wealth > 0 THEN
    v_effective_bps := floor((v_tax * 10000) / p_total_wealth);
  END IF;

  RETURN jsonb_build_object(
    'total_wealth', p_total_wealth,
    'taxable_excess', v_excess,
    'tax_amount', v_tax,
    'effective_rate_bps', v_effective_bps
  );
END;
$$;

-- 4. Batch Wealth Tax Execution Procedure
CREATE OR REPLACE FUNCTION public.treasury_execute_progressive_wealth_tax(
  p_admin_id uuid,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_rec record;
  v_tax_calc jsonb;
  v_tax_amount numeric;
  v_total_collected numeric := 0;
  v_assessed_count integer := 0;
  v_welfare_vault_id uuid;
  v_welfare_balance text;
  v_new_welfare_balance text;
  v_user_account_id uuid;
  v_user_cash numeric;
BEGIN
  IF p_admin_id IS NULL THEN
    RAISE EXCEPTION 'p_admin_id cannot be null';
  END IF;

  -- 1) Find VAULT_WELFARE
  SELECT id, balance_wld INTO v_welfare_vault_id, v_welfare_balance
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_WELFARE'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'VAULT_WELFARE not found in system_treasury_vaults';
  END IF;

  -- 2) Loop over users with total wealth > 10,000 WLD
  FOR v_rec IN
    SELECT 
      a.owner_user_id AS user_id,
      sum(b.available_amount::numeric) AS total_wealth
    FROM public.accounts a
    JOIN public.account_balances b ON a.id = b.account_id
    WHERE a.owner_user_id IS NOT NULL 
      AND a.status = 'active'
    GROUP BY a.owner_user_id
    HAVING sum(b.available_amount::numeric) > 10000
    ORDER BY sum(b.available_amount::numeric) DESC
  LOOP
    v_tax_calc := public.calculate_progressive_wealth_tax(v_rec.total_wealth);
    v_tax_amount := (v_tax_calc->>'tax_amount')::numeric;

    IF v_tax_amount > 0 THEN
      -- Get user active cash account
      SELECT a.id, b.available_amount::numeric INTO v_user_account_id, v_user_cash
      FROM public.accounts a
      JOIN public.account_balances b ON a.id = b.account_id
      WHERE a.owner_user_id = v_rec.user_id 
        AND a.account_type = 'USER_CASH'
        AND a.status = 'active'
      FOR UPDATE;

      -- If cash is sufficient, deduct from cash (or cap at cash)
      IF v_user_cash IS NOT NULL AND v_user_cash > 0 THEN
        IF v_tax_amount > v_user_cash THEN
          v_tax_amount := v_user_cash;
        END IF;

        -- Deduct from user account
        UPDATE public.account_balances
        SET available_amount = available_amount - v_tax_amount,
            updated_at = clock_timestamp()
        WHERE account_id = v_user_account_id;

        -- Record assessment
        INSERT INTO public.treasury_wealth_tax_assessments (
          user_id,
          assessed_date,
          total_wealth_wld,
          taxable_excess_wld,
          tax_amount_wld,
          effective_rate_bps,
          admin_id,
          reason
        ) VALUES (
          v_rec.user_id,
          CURRENT_DATE,
          v_rec.total_wealth,
          (v_tax_calc->>'taxable_excess')::numeric,
          v_tax_amount,
          (v_tax_calc->>'effective_rate_bps')::integer,
          p_admin_id,
          coalesce(p_reason, '고액 자산가 누진적 부유세 정기 과세 집행')
        );

        v_total_collected := v_total_collected + v_tax_amount;
        v_assessed_count := v_assessed_count + 1;
      END IF;
    END IF;
  END LOOP;

  -- 3) Deposit total collected into VAULT_WELFARE
  IF v_total_collected > 0 THEN
    v_new_welfare_balance := (v_welfare_balance::numeric + v_total_collected)::bigint::text;

    UPDATE public.system_treasury_vaults
    SET balance_wld = v_new_welfare_balance,
        updated_at = clock_timestamp()
    WHERE id = v_welfare_vault_id;

    -- Record in system_treasury_ledger
    INSERT INTO public.system_treasury_ledger (
      vault_id,
      tx_type,
      amount_wld,
      balance_after,
      actor_id,
      reason
    ) VALUES (
      v_welfare_vault_id,
      'WEALTH_TAX_COLLECTION',
      v_total_collected::bigint::text,
      v_new_welfare_balance,
      p_admin_id,
      format('고액 자산가 %s명 누진 부유세 징수 및 복지기금 적립: %s', v_assessed_count, coalesce(p_reason, '부자 과세 집행'))
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'assessed_count', v_assessed_count,
    'total_collected_wld', v_total_collected::bigint::text,
    'welfare_balance_after', (coalesce(v_new_welfare_balance, v_welfare_balance))::text,
    'executed_at', clock_timestamp()
  );
END;
$$;

-- 5. Permissions
GRANT EXECUTE ON FUNCTION public.calculate_progressive_wealth_tax(numeric) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_execute_progressive_wealth_tax(uuid, text) TO moneyverse_app;
GRANT SELECT, INSERT ON public.treasury_wealth_tax_assessments TO moneyverse_app;

COMMIT;
