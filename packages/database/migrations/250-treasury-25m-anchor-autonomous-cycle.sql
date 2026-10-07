-- Migration: 250-treasury-growth-engine.sql
-- Goal: Set Treasury Floor Reserve to 25,000,000 WLD and enable autonomous compounding growth (investment + harvest + corporate taxes)

-- 1. treasury_swf_configs 스키마 확장 (성장 및 자율 세수 필드 추가)
ALTER TABLE public.treasury_swf_configs
  ADD COLUMN IF NOT EXISTS auto_harvest_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_tax_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_growth_yield_bps INT NOT NULL DEFAULT 150, -- 시간당 1.5% 목표 복리 성장률
  ADD COLUMN IF NOT EXISTS target_anchor_wld NUMERIC(20, 0) NOT NULL DEFAULT 25000000;

-- 2. 기본 설정 업데이트 (2,500만 WLD 최소 바닥 유지 & 초과분 복리 재투자)
UPDATE public.treasury_swf_configs
SET safe_reserve_wld = 25000000,
    target_anchor_wld = 25000000,
    equity_ratio_pct = 60.00,
    bond_ratio_pct = 30.00,
    dividend_ratio_pct = 10.00,
    auto_harvest_enabled = true,
    auto_tax_enabled = true,
    auto_growth_yield_bps = 150,
    updated_at = NOW()
WHERE id = 'current';

-- 3. 중앙 국고(VAULT_MAIN) 잔액을 최소 2,500만 WLD 기초 시드로 보강
DO $$
DECLARE
  v_main_id UUID;
  v_emg_id UUID;
  v_main_balance NUMERIC;
  v_emg_balance NUMERIC;
  v_diff NUMERIC;
BEGIN
  SELECT id, balance_wld::numeric INTO v_main_id, v_main_balance
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  SELECT id, balance_wld::numeric INTO v_emg_id, v_emg_balance
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_EMERGENCY'
  FOR UPDATE;

  IF v_main_balance IS NOT NULL AND v_main_balance < 25000000 THEN
    v_diff := 25000000 - v_main_balance;
    
    -- 비상 금고에서 차감
    UPDATE public.system_treasury_vaults
    SET balance_wld = (v_emg_balance - v_diff)::text,
        updated_at = NOW()
    WHERE id = v_emg_id;

    -- 메인 국고로 보충하여 최소 25,000,000 WLD 달성
    UPDATE public.system_treasury_vaults
    SET balance_wld = '25000000',
        updated_at = NOW()
    WHERE id = v_main_id;

    -- 국고 감사 레저에 시드 충당 기록 (FEE_RECIRCULATION 사용)
    INSERT INTO public.system_treasury_ledger (
      vault_id,
      tx_type,
      amount_wld,
      reason,
      balance_before,
      balance_after,
      created_at
    ) VALUES (
      v_main_id,
      'FEE_RECIRCULATION',
      v_diff::text,
      '국고 2,500만 WLD 최소 안전 기초 원금(Floor Reserve) 충당 및 자율 복리 성장 엔진 가동',
      v_main_balance::text,
      '25000000',
      NOW()
    );
  END IF;
END $$;
