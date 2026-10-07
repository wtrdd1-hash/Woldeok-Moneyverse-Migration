-- Migration 249: Treasury Autonomous Sovereign Wealth Fund (ASWF) Engine
-- 노르웨이 GPFG / 싱가포르 테마섹 벤치마킹: 국고 잉여금 자율 투자 및 시장 재순환 엔진

CREATE TABLE IF NOT EXISTS public.treasury_swf_configs (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'current',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    safe_reserve_wld NUMERIC(38,0) NOT NULL DEFAULT 50000000,
    max_single_investment_wld NUMERIC(38,0) NOT NULL DEFAULT 10000000,
    equity_ratio_pct NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    bond_ratio_pct NUMERIC(5,2) NOT NULL DEFAULT 30.00,
    dividend_ratio_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    rebalance_interval_hours INT NOT NULL DEFAULT 1,
    last_executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS public.treasury_swf_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type VARCHAR(32) NOT NULL, -- 'STOCK', 'CENTRAL_BANK_BOND'
    asset_symbol VARCHAR(32) NOT NULL UNIQUE,
    asset_name VARCHAR(128) NOT NULL,
    quantity NUMERIC(38,4) NOT NULL DEFAULT 0,
    total_invested_wld NUMERIC(38,0) NOT NULL DEFAULT 0,
    average_price_wld NUMERIC(38,4) NOT NULL DEFAULT 0,
    current_valuation_wld NUMERIC(38,0) NOT NULL DEFAULT 0,
    unrealized_pnl_wld NUMERIC(38,0) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS public.treasury_swf_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL, -- 'EQUITY_PURCHASE', 'BOND_DEPOSIT', 'CITIZEN_DIVIDEND', 'PROFIT_HARVEST'
    amount_wld NUMERIC(38,0) NOT NULL,
    summary TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_treasury_swf_events_created_at
ON public.treasury_swf_events (created_at DESC);

-- 초기 설정 시드 (없을 경우 삽입)
INSERT INTO public.treasury_swf_configs (id, is_enabled, safe_reserve_wld, max_single_investment_wld, equity_ratio_pct, bond_ratio_pct, dividend_ratio_pct)
VALUES ('current', true, 50000000, 10000000, 50.00, 30.00, 20.00)
ON CONFLICT (id) DO NOTHING;

-- 초기 핵심 우량주 포트폴리오 등록 (WDX 4대 핵심 섹터주)
INSERT INTO public.treasury_swf_portfolios (asset_type, asset_symbol, asset_name, quantity, total_invested_wld, average_price_wld, current_valuation_wld, unrealized_pnl_wld)
VALUES 
    ('STOCK', 'WDX-TEC', '월덕 테크놀로지 (기술 대표주)', 12500, 25000000, 2000, 26250000, 1250000),
    ('STOCK', 'WDX-FIN', '월덕 파이낸셜 (금융 대표주)', 18000, 18000000, 1000, 19080000, 1080000),
    ('STOCK', 'WDX-BIO', '월덕 바이오헬스케어 (바이오주)', 8000, 12000000, 1500, 12480000, 480000),
    ('STOCK', 'WDX-RET', '월덕 리테일 커머스 (유통 대표주)', 15000, 15000000, 1000, 15600000, 600000)
ON CONFLICT (asset_symbol) DO NOTHING;
