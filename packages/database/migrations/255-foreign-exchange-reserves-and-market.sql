-- ======================================================================================
-- Migration 255: 한국은행 외환보유액 운용 및 서울외환시장(FX) 실시간 환율 & 스무딩 오퍼레이션
-- ======================================================================================

CREATE TABLE IF NOT EXISTS public.foreign_exchange_reserves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserve_name TEXT NOT NULL DEFAULT '중앙은행 외환보유액 (FX Reserves Vault)',
    currency TEXT NOT NULL DEFAULT 'USD',
    total_reserves_usd NUMERIC(20, 2) NOT NULL DEFAULT 1000000.00,
    target_anchor_rate NUMERIC(12, 4) NOT NULL DEFAULT 1350.0000,
    current_rate NUMERIC(12, 4) NOT NULL DEFAULT 1352.5000,
    is_halted BOOLEAN NOT NULL DEFAULT FALSE,
    total_interventions_count INTEGER NOT NULL DEFAULT 0,
    total_intervened_usd NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.foreign_exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate NUMERIC(12, 4) NOT NULL,
    change_pct NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    volume_usd NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    intervention_type TEXT DEFAULT 'NONE',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.foreign_exchange_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    usd_balance NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    total_swapped_wld_in NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    total_swapped_usd_out NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    usd_savings_interest_earned NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.foreign_exchange_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    transaction_type TEXT NOT NULL,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    from_amount NUMERIC(20, 2) NOT NULL,
    to_amount NUMERIC(20, 2) NOT NULL,
    applied_rate NUMERIC(12, 4) NOT NULL,
    fee_wld NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fx_rates_created_at ON public.foreign_exchange_rates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fx_wallets_user_id ON public.foreign_exchange_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_fx_txs_user_id ON public.foreign_exchange_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fx_txs_created_at ON public.foreign_exchange_transactions(created_at DESC);

-- 초기 시드 데이터
INSERT INTO public.foreign_exchange_reserves (
    reserve_name, currency, total_reserves_usd, target_anchor_rate, current_rate, is_halted
)
SELECT '중앙은행 외환보유액 (FX Reserves Vault)', 'USD', 1000000.00, 1350.0000, 1352.5000, FALSE
WHERE NOT EXISTS (SELECT 1 FROM public.foreign_exchange_reserves);

INSERT INTO public.foreign_exchange_rates (rate, change_pct, volume_usd, intervention_type, note)
SELECT 1352.5000, 0.1852, 125000.00, 'NONE', '외환시장 개장 기준환율'
WHERE NOT EXISTS (SELECT 1 FROM public.foreign_exchange_rates);
