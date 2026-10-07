-- Migration 252: Treasury Bonds (KTB) Exchange & Coupon Yields System
-- Based on South Korea KTB & US TreasuryDirect standards.

CREATE TABLE IF NOT EXISTS public.treasury_bonds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    maturity_hours INTEGER NOT NULL,
    annual_coupon_rate_bps INTEGER NOT NULL DEFAULT 450,
    hourly_coupon_rate_bps INTEGER NOT NULL DEFAULT 5,
    par_value_wld NUMERIC(20, 0) NOT NULL DEFAULT 10000,
    total_issued_units BIGINT NOT NULL DEFAULT 1000,
    available_units BIGINT NOT NULL DEFAULT 1000,
    total_funded_wld NUMERIC(20, 0) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN_SUBSCRIPTION', -- 'OPEN_SUBSCRIPTION', 'TRADING', 'CLOSED', 'FROZEN'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.treasury_bond_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    bond_id UUID NOT NULL REFERENCES public.treasury_bonds(id) ON DELETE CASCADE,
    units BIGINT NOT NULL DEFAULT 1,
    purchase_price_total_wld NUMERIC(20, 0) NOT NULL,
    accrued_interest_wld NUMERIC(20, 0) NOT NULL DEFAULT 0,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    maturity_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'HOLDING', -- 'HOLDING', 'MATURED', 'SOLD'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tb_holdings_user ON public.treasury_bond_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_tb_holdings_bond ON public.treasury_bond_holdings(bond_id);

CREATE TABLE IF NOT EXISTS public.treasury_bond_coupon_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID REFERENCES public.treasury_bond_holdings(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    bond_id UUID NOT NULL REFERENCES public.treasury_bonds(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'COUPON_INTEREST', 'MATURITY_REDEMPTION', 'EARLY_SELL'
    amount_wld NUMERIC(20, 0) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tb_coupon_user ON public.treasury_bond_coupon_logs(user_id);

CREATE TABLE IF NOT EXISTS public.treasury_bond_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL,
    bond_id UUID NOT NULL REFERENCES public.treasury_bonds(id) ON DELETE CASCADE,
    holding_id UUID NOT NULL REFERENCES public.treasury_bond_holdings(id) ON DELETE CASCADE,
    units BIGINT NOT NULL DEFAULT 1,
    unit_price_wld NUMERIC(20, 0) NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'FILLED', 'CANCELLED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial 3 benchmark Treasury Bonds
INSERT INTO public.treasury_bonds (
    symbol, name, maturity_hours, annual_coupon_rate_bps, hourly_coupon_rate_bps, par_value_wld, total_issued_units, available_units, status, description
) VALUES
(
    'KTB-01Y', '월덱 1년물 단기국채 (KTB Short-Term 1Y)', 24, 450, 5, 10000, 5000, 5000, 'OPEN_SUBSCRIPTION',
    '기획재정부 발행 24시간(가상 1년) 만기 초단기 국채. 확정 쿠폰이자율 연 4.5% (시간당 0.05%), 원금 100% 국가 보증.'
),
(
    'KTB-03Y', '월덱 3년물 벤치마크국채 (KTB Benchmark 3Y)', 72, 520, 6, 50000, 2000, 2000, 'OPEN_SUBSCRIPTION',
    '국가 기간망 인프라 확충 재원 조달용 72시간 만기 표준 벤치마크 국채. 확정 쿠폰이자율 연 5.2% (시간당 0.06%).'
),
(
    'KTB-05Y', '월덱 5년물 장기인프라국채 (KTB Long-Term 5Y)', 120, 650, 8, 100000, 1000, 1000, 'OPEN_SUBSCRIPTION',
    '국가 미래 신성장 동력 지원 120시간 만기 장기 국채. 확정 쿠폰이자율 연 6.5% (시간당 0.08%), 최고 수준 안정성.'
)
ON CONFLICT (symbol) DO NOTHING;
