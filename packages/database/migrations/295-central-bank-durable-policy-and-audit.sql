-- v2026.10.29.1503 — policy-only decisions; zero ledger, mint, or treasury money writes.
BEGIN;
ALTER TABLE public.central_bank_monetary_policy
  ADD COLUMN IF NOT EXISTS reserve_requirement_ratio numeric(6,4) NOT NULL DEFAULT 0.0700
  CHECK (reserve_requirement_ratio BETWEEN 0.0100 AND 0.5000);
ALTER TABLE public.central_bank_monetary_policy
  ADD COLUMN IF NOT EXISTS reserve_decision_at timestamptz NOT NULL DEFAULT clock_timestamp();
ALTER TABLE public.central_bank_monetary_policy
  ADD COLUMN IF NOT EXISTS reserve_rationale text NOT NULL DEFAULT 'Existing statutory reserve ratio';
ALTER TABLE public.central_bank_monetary_policy
  ADD COLUMN IF NOT EXISTS reserve_decided_by uuid REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.central_bank_monetary_policy
  ADD COLUMN IF NOT EXISTS rate_decided_by uuid REFERENCES public.users(id) ON DELETE SET NULL;
CREATE TABLE IF NOT EXISTS public.central_bank_policy_decisions (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES public.central_bank_monetary_policy(id) ON DELETE RESTRICT,
  decision_type text NOT NULL CHECK (decision_type IN ('BASE_RATE','RESERVE_REQUIREMENT')),
  previous_value numeric(6,4) NOT NULL,
  new_value numeric(6,4) NOT NULL,
  rationale text NOT NULL CHECK (char_length(rationale) BETWEEN 10 AND 2000),
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_cb_policy_decisions_created
 ON public.central_bank_policy_decisions (created_at DESC);
REVOKE UPDATE, DELETE ON public.central_bank_policy_decisions FROM PUBLIC, moneyverse_app;
GRANT SELECT, INSERT ON public.central_bank_policy_decisions TO moneyverse_app;
GRANT SELECT, UPDATE ON public.central_bank_monetary_policy TO moneyverse_app;
COMMIT;
