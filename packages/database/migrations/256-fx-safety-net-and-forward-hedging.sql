-- Migration 256: Global FX Safety Net, Currency Swap Facilities, and Forward FX Hedging
-- Benchmarked after Bank of Korea, IMF SDR Basket, and Covered Interest Parity (CIP) Forward Trading

CREATE TABLE IF NOT EXISTS foreign_exchange_asset_allocations (
    id VARCHAR(64) PRIMARY KEY,
    asset_name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(32) NOT NULL, -- 'SDR_CURRENCY', 'PRECIOUS_METAL'
    allocation_weight_pct NUMERIC(6, 2) NOT NULL,
    holding_amount NUMERIC(20, 4) NOT NULL DEFAULT 0,
    unit VARCHAR(16) NOT NULL,
    usd_value NUMERIC(20, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS currency_swap_agreements (
    id VARCHAR(64) PRIMARY KEY,
    counterparty VARCHAR(100) NOT NULL,
    total_facility_usd BIGINT NOT NULL,
    drawn_amount_usd BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'DRAWN', 'EXPIRED'
    interest_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 5.25,
    effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '365 days'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS currency_swap_drawdowns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id VARCHAR(64) NOT NULL REFERENCES currency_swap_agreements(id),
    action VARCHAR(32) NOT NULL, -- 'DRAWDOWN', 'REPAYMENT'
    amount_usd BIGINT NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    executed_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fx_forward_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    position VARCHAR(16) NOT NULL, -- 'BUY_USD', 'SELL_USD'
    tenor VARCHAR(16) NOT NULL, -- '1M', '3M', '6M'
    contract_amount_usd NUMERIC(16, 2) NOT NULL,
    contract_rate NUMERIC(12, 4) NOT NULL,
    spot_rate_at_contract NUMERIC(12, 4) NOT NULL,
    margin_wld NUMERIC(16, 2) NOT NULL,
    maturity_date TIMESTAMPTZ NOT NULL,
    settlement_rate NUMERIC(12, 4),
    realized_pnl_wld NUMERIC(16, 2),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SETTLED', 'CANCELLED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS fx_early_warning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fsi_score NUMERIC(5, 2) NOT NULL,
    stage VARCHAR(32) NOT NULL, -- 'NORMAL', 'WATCH', 'CAUTION', 'EMERGENCY'
    trigger_reason VARCHAR(255) NOT NULL,
    current_spot_rate NUMERIC(12, 4) NOT NULL,
    discord_notified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed IMF SDR Basket Allocations & Bank of Korea Gold Reserve
INSERT INTO foreign_exchange_asset_allocations (id, asset_name, asset_type, allocation_weight_pct, holding_amount, unit, usd_value)
VALUES
    ('SDR_USD', '미국 달러 (USD)', 'SDR_CURRENCY', 43.38, 433800.00, 'USD', 433800.00),
    ('SDR_EUR', '유로화 (EUR)', 'SDR_CURRENCY', 29.31, 268899.00, 'EUR', 293100.00),
    ('SDR_CNY', '중국 위안화 (CNY)', 'SDR_CURRENCY', 12.28, 884160.00, 'CNY', 122800.00),
    ('SDR_JPY', '일본 엔화 (JPY)', 'SDR_CURRENCY', 7.59, 11688600.00, 'JPY', 75900.00),
    ('SDR_GBP', '영국 파운드 (GBP)', 'SDR_CURRENCY', 7.44, 57230.00, 'GBP', 74400.00),
    ('GOLD_RESERVE', '한국은행 실물 금 비축고 (104.4t)', 'PRECIOUS_METAL', 10.00, 1000.00, 'OZ', 2650000.00)
ON CONFLICT (id) DO NOTHING;

-- Seed US-Korea & Japan-Korea Bilateral Currency Swap Lines
INSERT INTO currency_swap_agreements (id, counterparty, total_facility_usd, drawn_amount_usd, status, interest_rate_pct)
VALUES
    ('SWAP_FED_BOK', '미국 연방준비제도 (US Federal Reserve)', 60000000000, 0, 'ACTIVE', 5.25),
    ('SWAP_BOJ_BOK', '일본은행 (Bank of Japan)', 10000000000, 0, 'ACTIVE', 0.25)
ON CONFLICT (id) DO NOTHING;
