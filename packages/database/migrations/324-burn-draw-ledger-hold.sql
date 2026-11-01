-- P0 burn draw containment: immutable migration 263 directly debited account_balances,
-- inserted a legacy ledger_entries row rather than canonical balanced postings,
-- and did not accept a replay key. Preserve historical records; never invent receipts.
BEGIN;

CREATE OR REPLACE FUNCTION public.participate_anti_inflation_burn_draw(
  p_user_id uuid,
  p_burn_amount numeric DEFAULT 10000
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'burn draw ledger settlement is unavailable';
END;
$$;

ALTER FUNCTION public.participate_anti_inflation_burn_draw(uuid, numeric) OWNER TO moneyverse_migrator;
REVOKE EXECUTE ON FUNCTION public.participate_anti_inflation_burn_draw(uuid, numeric) FROM PUBLIC, moneyverse_app;
COMMIT;
