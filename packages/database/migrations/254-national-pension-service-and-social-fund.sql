-- Migration 254: National Pension Service (NPS) & Sovereign Pension Fund Schema
-- 대한민국 국민연금공단(NPS) 및 싱가포르 CPF 벤치마크 공적 연금 적립 & 평생 기초연금 지급 시스템

CREATE TABLE IF NOT EXISTS public.national_pension_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    benchmark_annual_payout_rate_bps INT NOT NULL DEFAULT 800, -- 기본 연 8.0% 기초연금
    min_contribution_unit_wld NUMERIC NOT NULL DEFAULT 1000,     -- 최소 1회 납입액 1,000 WLD
    early_liquidation_penalty_bps INT NOT NULL DEFAULT 500,     -- 중도 환급 시 복지기금 귀속률 5.0%
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 초기 기준 설정 시드
INSERT INTO public.national_pension_configs (
    benchmark_annual_payout_rate_bps,
    min_contribution_unit_wld,
    early_liquidation_penalty_bps,
    is_active
) VALUES (800, 1000, 500, TRUE)
ON CONFLICT DO NOTHING;

-- 유저별 국민연금 가입 계좌
CREATE TABLE IF NOT EXISTS public.national_pension_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    tier VARCHAR(32) NOT NULL DEFAULT 'TIER_1_YOUTH', -- TIER_1_YOUTH, TIER_2_CITIZEN, TIER_3_GOLD, TIER_4_PLATINUM, TIER_5_HONOR
    status VARCHAR(32) NOT NULL DEFAULT 'ACCUMULATING', -- ACCUMULATING(적립중), RETIRED_RECEIVING(은퇴수령중), LIQUIDATED(중도해지)
    accumulated_contribution_wld NUMERIC NOT NULL DEFAULT 0 CHECK (accumulated_contribution_wld >= 0),
    total_contributions_count INT NOT NULL DEFAULT 0 CHECK (total_contributions_count >= 0),
    hourly_payout_rate_bps INT NOT NULL DEFAULT 8,     -- 시간당 연금 지급률 (bps, 8bps = 0.08% = 약 연 7.0%)
    total_payout_received_wld NUMERIC NOT NULL DEFAULT 0 CHECK (total_payout_received_wld >= 0),
    last_payout_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nps_accounts_user_id ON public.national_pension_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_nps_accounts_status ON public.national_pension_accounts(status);

-- 국민연금 기여금 납입 이력
CREATE TABLE IF NOT EXISTS public.national_pension_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.national_pension_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    amount_wld NUMERIC NOT NULL CHECK (amount_wld > 0),
    note TEXT NOT NULL DEFAULT '국민연금 정기/수시 기여금 납입',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nps_contributions_account ON public.national_pension_contributions(account_id);
CREATE INDEX IF NOT EXISTS idx_nps_contributions_user ON public.national_pension_contributions(user_id);

-- 국민연금 정기 기초연금 지급 내역
CREATE TABLE IF NOT EXISTS public.national_pension_payout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.national_pension_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    payout_amount_wld NUMERIC NOT NULL CHECK (payout_amount_wld > 0),
    snapshot_accumulated_wld NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nps_payouts_account ON public.national_pension_payout_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_nps_payouts_user ON public.national_pension_payout_logs(user_id);
