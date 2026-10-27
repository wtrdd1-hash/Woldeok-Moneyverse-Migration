-- 281-season-reward-ledger-settlement-hold.sql
-- P0 #1507: migration 231 directly credited USER_CASH without balanced
-- ledger_postings, optionally debited SYSTEM, and silently ignored duplicate
-- transaction idempotency keys. Do not fabricate a historical journal or
-- alter balances. Suspend new claims until an independently reviewed,
-- funded, atomic Economy Core settlement with immutable replay receipts exists.
-- Forward-only: never edit applied migration 231.
BEGIN;

CREATE OR REPLACE FUNCTION public.season_claim_reward(
  p_actor uuid,
  p_season_id uuid,
  p_idempotency_key uuid
)
RETURNS TABLE(
  claim_id uuid,
  season_id uuid,
  season_name text,
  tier text,
  rank integer,
  reward_wld numeric,
  trophy_code text,
  claimed_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'season reward ledger settlement is unavailable';
END;
$$;

-- Existing PostgreSQL functions default to PUBLIC EXECUTE; revoke both
-- that implicit path and the application role's direct execution.
REVOKE EXECUTE ON FUNCTION public.season_claim_reward(uuid, uuid, uuid) FROM PUBLIC, moneyverse_app;

-- Legacy migration 231 granted broad DML on claim receipts to the app role.
-- Only SECURITY DEFINER settlement functions may mutate those rows.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.season_reward_claims FROM moneyverse_app;

COMMIT;
