-- ==============================================================================
-- Migration 251: State-Owned Enterprises (SOE), State Holding Corporation & Private Enterprise Governance
-- Specification: docs/STATE_ENTERPRISES_AND_CORPORATE_GOVERNANCE_SPEC.ko.md
-- ==============================================================================

-- 1. State-Owned Enterprises Table
CREATE TABLE IF NOT EXISTS public.state_enterprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'ENERGY', 'INFRASTRUCTURE', 'DEVELOPMENT_BANK'
    ceo_name TEXT NOT NULL DEFAULT '국가전문경영인',
    total_assets_wld NUMERIC(20, 0) NOT NULL DEFAULT 50000000,
    operating_revenue_hourly_wld NUMERIC(20, 0) NOT NULL DEFAULT 150000,
    operating_cost_hourly_wld NUMERIC(20, 0) NOT NULL DEFAULT 50000,
    net_profit_hourly_wld NUMERIC(20, 0) NOT NULL DEFAULT 100000,
    dividend_rate_bps INTEGER NOT NULL DEFAULT 3000, -- 30.00%
    eval_grade TEXT NOT NULL DEFAULT 'A', -- 'S', 'A', 'B', 'C', 'D', 'E'
    eval_score INTEGER NOT NULL DEFAULT 88, -- 0 ~ 100
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'PRIVATIZING'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. State Enterprise Dividend Logs Table
CREATE TABLE IF NOT EXISTS public.state_enterprise_dividend_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL REFERENCES public.state_enterprises(id) ON DELETE CASCADE,
    dividend_amount_wld NUMERIC(20, 0) NOT NULL,
    revenue_wld NUMERIC(20, 0) NOT NULL,
    net_profit_wld NUMERIC(20, 0) NOT NULL,
    eval_grade TEXT NOT NULL,
    ledger_tx_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Private Enterprises (Venture & Corporate Ecosystem) Table
CREATE TABLE IF NOT EXISTS public.private_enterprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    sector TEXT NOT NULL DEFAULT 'TECH',
    stage TEXT NOT NULL DEFAULT 'SEED', -- 'SEED', 'SERIES_A', 'SERIES_B', 'IPO_LISTED'
    valuation_wld NUMERIC(20, 0) NOT NULL DEFAULT 100000,
    revenue_hourly_wld NUMERIC(20, 0) NOT NULL DEFAULT 10000,
    corporate_tax_rate_bps INTEGER NOT NULL DEFAULT 1500, -- 15.00%
    tax_paid_total_wld NUMERIC(20, 0) NOT NULL DEFAULT 0,
    dividends_paid_total_wld NUMERIC(20, 0) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Seed Core 3 State-Owned Enterprises (SOE)
INSERT INTO public.state_enterprises (
    code, name, category, ceo_name, total_assets_wld, 
    operating_revenue_hourly_wld, operating_cost_hourly_wld, net_profit_hourly_wld, 
    dividend_rate_bps, eval_grade, eval_score, status, description
) VALUES
(
    'SOE_POWER',
    '월덱 에너지공사 (W-Power)',
    'ENERGY',
    '강전력 (전력에너지전문관)',
    120000000,
    180000,
    60000,
    120000,
    3000,
    'S',
    96,
    'ACTIVE',
    '국가 기간 전력 인프라망 공급, 가상 채굴 및 서버 데이터센터 에너지 안정화 전담 공기업'
),
(
    'SOE_NET',
    '월덱 네트워크교통공사 (W-Net & Transit)',
    'INFRASTRUCTURE',
    '송통신 (망인프라전문관)',
    95000000,
    140000,
    50000,
    90000,
    3000,
    'A',
    89,
    'ACTIVE',
    '가상 거래소 결제망, 장터 고속 데이터 통신망 및 상거래 트래픽 인프라 유지보수 전담 공기업'
),
(
    'SOE_BANK',
    '월덱 국책투자은행 (WDB Development Bank)',
    'DEVELOPMENT_BANK',
    '윤국책 (금융투자전문관)',
    150000000,
    220000,
    70000,
    150000,
    3000,
    'A',
    92,
    'ACTIVE',
    '유저 스타트업 저금리 팩토링, 혁신 벤처 펀딩, 국채 발행 및 시장 안정화 전담 국가개발금융공사'
)
ON CONFLICT (code) DO UPDATE SET
    total_assets_wld = EXCLUDED.total_assets_wld,
    operating_revenue_hourly_wld = EXCLUDED.operating_revenue_hourly_wld,
    net_profit_hourly_wld = EXCLUDED.net_profit_hourly_wld,
    eval_grade = EXCLUDED.eval_grade,
    eval_score = EXCLUDED.eval_score;

-- 5. Seed Private Enterprises (Ventures to IPO)
INSERT INTO public.private_enterprises (
    symbol, name, sector, stage, valuation_wld, revenue_hourly_wld, corporate_tax_rate_bps
) VALUES
('VENTURE-AI', '넥스트마인드 AI (NextMind)', 'TECH', 'IPO_LISTED', 25000000, 45000, 1500),
('VENTURE-PAY', '월덱 핀페이 (FinPay)', 'FINTECH', 'IPO_LISTED', 18000000, 32000, 1500),
('VENTURE-BIO', '셀리버스 제약 (CelliVerse)', 'BIO', 'SERIES_B', 8500000, 18000, 1500),
('VENTURE-GAME', '픽셀랩스 엔터테인먼트', 'GAMING', 'SERIES_A', 3200000, 9500, 1500),
('VENTURE-ECO', '그린루프 스마트팜', 'ECO_AGRI', 'SEED', 1200000, 4000, 1500)
ON CONFLICT (symbol) DO NOTHING;
