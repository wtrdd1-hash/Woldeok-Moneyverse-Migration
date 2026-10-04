-- Migration: 245-automated-monetary-regulation.sql
-- Description: Automated Monetary Supply Rebalancing Engine configuration and regulation events ledger

CREATE TABLE IF NOT EXISTS public.monetary_auto_regulation_configs (
    id INT PRIMARY KEY DEFAULT 1,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    target_faucet_sink_ratio NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    tolerance_band_pct NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    max_step_pct NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    evaluation_interval_seconds INT NOT NULL DEFAULT 3600,
    circuit_breaker_freeze_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    last_evaluated_at TIMESTAMPTZ,
    last_action_taken VARCHAR(64) NOT NULL DEFAULT 'NONE',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_monetary_auto_config_singleton CHECK (id = 1)
);

INSERT INTO public.monetary_auto_regulation_configs (
    id, is_enabled, target_faucet_sink_ratio, tolerance_band_pct, max_step_pct, evaluation_interval_seconds, circuit_breaker_freeze_pct
) VALUES (
    1, true, 1.00, 5.00, 5.00, 3600, 15.00
) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.monetary_regulation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    faucet_24h_wld NUMERIC(20,0) NOT NULL,
    sink_24h_wld NUMERIC(20,0) NOT NULL,
    current_ratio NUMERIC(10,4) NOT NULL,
    action_type VARCHAR(32) NOT NULL,
    adjustment_amount_wld NUMERIC(20,0) NOT NULL DEFAULT 0,
    policy_order_id UUID REFERENCES public.monetary_policy_orders(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monetary_regulation_events_created 
    ON public.monetary_regulation_events(created_at DESC);
