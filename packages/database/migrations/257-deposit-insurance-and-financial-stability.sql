-- Migration 257: Korea Deposit Insurance Corporation (KDIC) 50M Protection & Financial Stability Fund
-- Benchmarked after the Korean Depositor Protection Act and Financial Stability Liquidity Support

CREATE TABLE IF NOT EXISTS deposit_insurance_funds (
    id VARCHAR(64) PRIMARY KEY,
    fund_name VARCHAR(100) NOT NULL,
    total_fund_wld BIGINT NOT NULL DEFAULT 10000000,
    protection_limit_per_user BIGINT NOT NULL DEFAULT 500000, -- 1인당 50만 WLD (원화 5,000만원 상당)
    total_insured_deposits_wld BIGINT NOT NULL DEFAULT 0,
    cumulative_premiums_collected_wld BIGINT NOT NULL DEFAULT 0,
    cumulative_payouts_wld BIGINT NOT NULL DEFAULT 0,
    is_emergency_mode BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insured_institutions (
    id VARCHAR(64) PRIMARY KEY,
    institution_name VARCHAR(100) NOT NULL,
    institution_type VARCHAR(32) NOT NULL, -- 'BANK', 'SECURITIES'
    bis_ratio_pct NUMERIC(5, 2) NOT NULL DEFAULT 14.50,
    soundness_grade VARCHAR(32) NOT NULL DEFAULT 'GRADE_1',
    total_deposits_wld BIGINT NOT NULL DEFAULT 25000000,
    premium_rate_pct NUMERIC(5, 4) NOT NULL DEFAULT 0.0800, -- 연 0.08%
    status VARCHAR(32) NOT NULL DEFAULT 'HEALTHY',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deposit_insurance_premiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id VARCHAR(64) NOT NULL REFERENCES insured_institutions(id),
    quarter VARCHAR(32) NOT NULL,
    assessed_deposit_base BIGINT NOT NULL,
    premium_amount_wld BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COLLECTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deposit_insurance_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id VARCHAR(64) NOT NULL REFERENCES insured_institutions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    original_deposit_wld BIGINT NOT NULL,
    payout_amount_wld BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Initial KDIC Vault & Insured Institutions
INSERT INTO deposit_insurance_funds (
    id, fund_name, total_fund_wld, protection_limit_per_user, total_insured_deposits_wld
) VALUES (
    'KDIC_MAIN_FUND', '정부 예금보험공사 예금보험기금', 10000000, 500000, 25000000
) ON CONFLICT (id) DO NOTHING;

INSERT INTO insured_institutions (
    id, institution_name, institution_type, bis_ratio_pct, soundness_grade, total_deposits_wld, premium_rate_pct, status
) VALUES 
    ('BANK_COMMERCIAL', '머니버스 제1상업은행 (Commercial Bank)', 'BANK', 14.80, 'GRADE_1', 20000000, 0.0800, 'HEALTHY'),
    ('SECURITIES_MAIN', '월덕투자증권 (Securities & Trust)', 'SECURITIES', 13.20, 'GRADE_1', 5000000, 0.0800, 'HEALTHY')
ON CONFLICT (id) DO NOTHING;
