-- 224-admin-treasury-management.sql
-- Update version: v2026.09.21.319
-- P0 TREASURY-SPEC: Admin System Treasury Vault, Reserves & Dynamic Accounting Ledger
-- Manages authoritative system treasury vaults, reserve ratios, injections, sink absorptions, and stock halt settlements.

BEGIN;

-- 1. System Treasury Vaults Table
CREATE TABLE IF NOT EXISTS public.system_treasury_vaults (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (char_length(code) BETWEEN 2 AND 50),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  balance_wld text NOT NULL DEFAULT '0' CHECK (balance_wld ~ '^\d+$'),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- 2. System Treasury Ledger Table
CREATE TABLE IF NOT EXISTS public.system_treasury_ledger (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  vault_id uuid NOT NULL REFERENCES public.system_treasury_vaults(id) ON DELETE RESTRICT,
  tx_type text NOT NULL CHECK (tx_type IN ('INJECTION', 'ABSORPTION_SINK', 'STOCK_HALT_SETTLEMENT', 'FEE_RECIRCULATION', 'EMERGENCY_RESERVE_TRANSFER')),
  amount_wld text NOT NULL CHECK (amount_wld ~ '^\d+$' AND amount_wld::numeric > 0),
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reason text NOT NULL CHECK (char_length(reason) >= 10),
  balance_before text NOT NULL CHECK (balance_before ~ '^\d+$'),
  balance_after text NOT NULL CHECK (balance_after ~ '^\d+$'),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_treasury_vaults_code ON public.system_treasury_vaults(code);
CREATE INDEX IF NOT EXISTS idx_treasury_ledger_vault ON public.system_treasury_ledger(vault_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_treasury_ledger_actor ON public.system_treasury_ledger(actor_id);
CREATE INDEX IF NOT EXISTS idx_treasury_ledger_type ON public.system_treasury_ledger(tx_type);

-- 3. Initial Seed for Treasury Vaults
INSERT INTO public.system_treasury_vaults (code, name, balance_wld, description)
VALUES
  ('VAULT_MAIN', '중앙 국고 금고 (Main System Vault)', '10000000', '게임 내 시스템 수수료 재순환 및 공공 재정 집행을 위한 메인 국고 금고'),
  ('VAULT_EMERGENCY', '비상 환급 및 유동성 완충 금고 (Emergency Reserve)', '50000000', '주식 거래정지 원가환급 및 거시경제 위기 대응용 긴급 유동성 완충 비축금')
ON CONFLICT (code) DO NOTHING;

-- Initial Ledger entries for Seeds
INSERT INTO public.system_treasury_ledger (vault_id, tx_type, amount_wld, reason, balance_before, balance_after)
SELECT id, 'INJECTION', '10000000', '초기 국고 시스템 시드 자금 배정 (Genesis Treasury Allocation)', '0', '10000000'
FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN'
AND NOT EXISTS (SELECT 1 FROM public.system_treasury_ledger WHERE vault_id = public.system_treasury_vaults.id);

INSERT INTO public.system_treasury_ledger (vault_id, tx_type, amount_wld, reason, balance_before, balance_after)
SELECT id, 'INJECTION', '50000000', '초기 비상 완충 비축금 배정 (Emergency Buffer Allocation)', '0', '50000000'
FROM public.system_treasury_vaults WHERE code = 'VAULT_EMERGENCY'
AND NOT EXISTS (SELECT 1 FROM public.system_treasury_ledger WHERE vault_id = public.system_treasury_vaults.id);

-- 4. Helper Function: 국고 자금 긴급 주입 (INJECTION)
CREATE OR REPLACE FUNCTION public.treasury_inject(
  p_actor uuid,
  p_vault_code text,
  p_amount_wld text,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_vault_id uuid;
  v_current_bal numeric;
  v_amount numeric;
  v_new_bal numeric;
  v_tx_id uuid;
BEGIN
  IF char_length(p_reason) < 10 THEN
    RAISE EXCEPTION 'Treasury injection reason must be at least 10 characters';
  END IF;

  v_amount := p_amount_wld::numeric;
  IF v_amount <= 0 THEN
    RAISE EXCEPTION 'Treasury injection amount must be positive';
  END IF;

  SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
  FROM public.system_treasury_vaults
  WHERE code = p_vault_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Treasury vault not found: %', p_vault_code;
  END IF;

  v_new_bal := v_current_bal + v_amount;

  UPDATE public.system_treasury_vaults
  SET balance_wld = v_new_bal::text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = v_vault_id;

  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
  ) VALUES (
    v_vault_id, 'INJECTION', p_amount_wld, p_actor, p_reason, v_current_bal::text, v_new_bal::text
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'tx_id', v_tx_id,
    'vault_code', p_vault_code,
    'amount_wld', p_amount_wld,
    'balance_before', v_current_bal::text,
    'balance_after', v_new_bal::text,
    'created_at', pg_catalog.clock_timestamp()
  );
END;
$$;

-- 5. Helper Function: 국고 잉여 자금 소각 (ABSORPTION_SINK)
CREATE OR REPLACE FUNCTION public.treasury_absorb(
  p_actor uuid,
  p_vault_code text,
  p_amount_wld text,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_vault_id uuid;
  v_current_bal numeric;
  v_amount numeric;
  v_new_bal numeric;
  v_tx_id uuid;
BEGIN
  IF char_length(p_reason) < 10 THEN
    RAISE EXCEPTION 'Treasury absorption reason must be at least 10 characters';
  END IF;

  v_amount := p_amount_wld::numeric;
  IF v_amount <= 0 THEN
    RAISE EXCEPTION 'Treasury absorption amount must be positive';
  END IF;

  SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
  FROM public.system_treasury_vaults
  WHERE code = p_vault_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Treasury vault not found: %', p_vault_code;
  END IF;

  IF v_current_bal < v_amount THEN
    RAISE EXCEPTION 'Insufficient treasury balance: available %, requested %', v_current_bal, v_amount;
  END IF;

  v_new_bal := v_current_bal - v_amount;

  UPDATE public.system_treasury_vaults
  SET balance_wld = v_new_bal::text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = v_vault_id;

  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
  ) VALUES (
    v_vault_id, 'ABSORPTION_SINK', p_amount_wld, p_actor, p_reason, v_current_bal::text, v_new_bal::text
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'tx_id', v_tx_id,
    'vault_code', p_vault_code,
    'amount_wld', p_amount_wld,
    'balance_before', v_current_bal::text,
    'balance_after', v_new_bal::text,
    'created_at', pg_catalog.clock_timestamp()
  );
END;
$$;

-- 6. Helper Function: 주식 거래정지 시 비상 국고에서 우선 환급액 조달 (STOCK_HALT_SETTLEMENT)
CREATE OR REPLACE FUNCTION public.treasury_fund_stock_halt(
  p_stock_id uuid,
  p_required_amount_wld text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_vault_id uuid;
  v_current_bal numeric;
  v_required numeric;
  v_funded numeric;
  v_new_bal numeric;
  v_tx_id uuid;
BEGIN
  v_required := p_required_amount_wld::numeric;
  IF v_required <= 0 THEN
    RETURN jsonb_build_object('funded_wld', '0', 'remaining_wld', '0');
  END IF;

  -- 비상 완충 금고 우선 조회
  SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_EMERGENCY'
  FOR UPDATE;

  IF NOT FOUND THEN
    -- 메인 금고 fallback
    SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
    FROM public.system_treasury_vaults
    WHERE code = 'VAULT_MAIN'
    FOR UPDATE;
  END IF;

  IF NOT FOUND OR v_current_bal <= 0 THEN
    RETURN jsonb_build_object('funded_wld', '0', 'remaining_wld', p_required_amount_wld);
  END IF;

  v_funded := LEAST(v_current_bal, v_required);
  v_new_bal := v_current_bal - v_funded;

  UPDATE public.system_treasury_vaults
  SET balance_wld = v_new_bal::text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = v_vault_id;

  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, reason, balance_before, balance_after
  ) VALUES (
    v_vault_id,
    'STOCK_HALT_SETTLEMENT',
    v_funded::text,
    '가상 주식 거래정지 매수원가 자동정산 국고 지원 (Stock: ' || p_stock_id::text || ')',
    v_current_bal::text,
    v_new_bal::text
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'tx_id', v_tx_id,
    'funded_wld', v_funded::text,
    'remaining_wld', (v_required - v_funded)::text
  );
END;
$$;

-- 7. Grant least privilege permissions
GRANT SELECT ON public.system_treasury_vaults TO moneyverse_app;
GRANT SELECT ON public.system_treasury_ledger TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_inject(uuid, text, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_absorb(uuid, text, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_fund_stock_halt(uuid, text) TO moneyverse_app;

COMMIT;
