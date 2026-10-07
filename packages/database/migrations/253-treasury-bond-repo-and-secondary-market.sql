-- Migration 253: Treasury Bond Repo Loans & Secondary Market Enhancements
-- 1. Bond Repo Financing: Collateralized loans up to 80% LTV at low interest (2.5% APR)
-- 2. Auto-Rollover flag on holdings for compounding reinvestment

ALTER TABLE public.treasury_bond_holdings
ADD COLUMN IF NOT EXISTS auto_rollover BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS collateral_locked BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.treasury_bond_repo_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES public.treasury_bond_holdings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    principal_wld NUMERIC(20, 0) NOT NULL,
    annual_interest_rate_bps INTEGER NOT NULL DEFAULT 250, -- 2.5% APR repo loan
    hourly_interest_rate_bps INTEGER NOT NULL DEFAULT 3,
    accrued_interest_wld NUMERIC(20, 0) NOT NULL DEFAULT 0,
    ltv_percent INTEGER NOT NULL DEFAULT 80,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REPAID', 'LIQUIDATED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tb_repo_user ON public.treasury_bond_repo_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_tb_repo_holding ON public.treasury_bond_repo_loans(holding_id);

GRANT ALL PRIVILEGES ON TABLE public.treasury_bond_repo_loans TO moneyverse_app;
