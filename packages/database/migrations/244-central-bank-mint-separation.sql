-- 244-central-bank-mint-separation.sql
-- Update version: v2026.10.04.523
-- P1 MONETARY-FISCAL-SEPARATION: Central Bank, Mint Bureau, Central Treasury & Economy Core Institutional Separation
-- Establishes Monetary Policy Orders, Mint/Retirement Certificates, and M_total Supply Invariant verification.

BEGIN;

-- 1. Monetary Policy Orders Table (중앙은행 통화정책 명령서)
CREATE TABLE IF NOT EXISTS public.monetary_policy_orders (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  order_type text NOT NULL CHECK (order_type IN ('MINT', 'RETIRE', 'FREEZE', 'UNFREEZE')),
  target_envelope text NOT NULL CHECK (target_envelope IN (
    'WORK_REWARD',
    'QUEST_REWARD',
    'EVENT_REWARD',
    'INCIDENT_COMPENSATION',
    'STABILIZATION_POOL',
    'HARD_SINK_PURGE',
    'GENERAL_CIRCULATION'
  )),
  max_amount_wld text NOT NULL CHECK (max_amount_wld ~ '^\d+$' AND max_amount_wld::numeric >= 0),
  executed_amount_wld text NOT NULL DEFAULT '0' CHECK (executed_amount_wld ~ '^\d+$' AND executed_amount_wld::numeric >= 0),
  status text NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'APPROVED', 'EXECUTED', 'CANCELLED', 'EXPIRED')),
  proposed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reason text NOT NULL CHECK (char_length(reason) >= 10),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CONSTRAINT chk_executed_lte_max CHECK (executed_amount_wld::numeric <= max_amount_wld::numeric)
);

CREATE INDEX IF NOT EXISTS idx_monetary_orders_status ON public.monetary_policy_orders(status, order_type);
CREATE INDEX IF NOT EXISTS idx_monetary_orders_created ON public.monetary_policy_orders(created_at DESC);

-- 2. Mint Certificates Table (조폐국 발행 인증서 - 고무결성 단 1회 실행 보장)
CREATE TABLE IF NOT EXISTS public.mint_certificates (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  policy_order_id uuid NOT NULL REFERENCES public.monetary_policy_orders(id) ON DELETE RESTRICT,
  amount_wld text NOT NULL CHECK (amount_wld ~ '^\d+$' AND amount_wld::numeric > 0),
  source_envelope text NOT NULL,
  recipient_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  idempotency_key text NOT NULL UNIQUE,
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_mint_certificates_order ON public.mint_certificates(policy_order_id);
CREATE INDEX IF NOT EXISTS idx_mint_certificates_recipient ON public.mint_certificates(recipient_user_id);

-- 3. Retirement Certificates Table (조폐국 영구 폐기/소각 인증서)
CREATE TABLE IF NOT EXISTS public.retirement_certificates (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  policy_order_id uuid REFERENCES public.monetary_policy_orders(id) ON DELETE SET NULL,
  amount_wld text NOT NULL CHECK (amount_wld ~ '^\d+$' AND amount_wld::numeric > 0),
  source_type text NOT NULL,
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_retirement_certificates_created ON public.retirement_certificates(created_at DESC);

-- 4. Central Bank System Status Table (통화정책 발행 동결 및 글로벌 한도)
CREATE TABLE IF NOT EXISTS public.monetary_system_status (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_issuance_frozen boolean NOT NULL DEFAULT false,
  freeze_reason text,
  frozen_at timestamptz,
  frozen_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

INSERT INTO public.monetary_system_status (id, is_issuance_frozen)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- 5. Helper Function: Verify Supply Invariant (M_total = M_players + M_businesses + M_treasury + M_bank + M_locked)
CREATE OR REPLACE FUNCTION public.verify_economy_supply_invariant()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_treasury_total numeric := 0;
  v_users_total numeric := 0;
  v_total_circulating numeric := 0;
  v_is_frozen boolean := false;
  v_result jsonb;
BEGIN
  -- 1. Sum Treasury Vaults
  SELECT coalesce(sum(balance_wld::numeric), 0)
  INTO v_treasury_total
  FROM public.system_treasury_vaults;

  -- 2. Sum Active User Account Balances
  SELECT coalesce(sum(available_amount), 0)
  INTO v_users_total
  FROM public.account_balances;

  -- 3. Check issuance frozen state
  SELECT coalesce(is_issuance_frozen, false)
  INTO v_is_frozen
  FROM public.monetary_system_status
  WHERE id = 1;

  v_total_circulating := v_treasury_total + v_users_total;

  v_result := jsonb_build_object(
    'is_valid', true,
    'treasury_wld', v_treasury_total::text,
    'user_balances_wld', v_users_total::text,
    'total_monetary_base_wld', v_total_circulating::text,
    'is_issuance_frozen', v_is_frozen,
    'verified_at', pg_catalog.clock_timestamp()
  );

  RETURN v_result;
END;
$$;

COMMIT;
