-- 270-reconcile-post-233-security-boundaries.sql
-- v2026.10.14.630: forward-only least-privilege security correction.
-- Older applied migrations (260-269) MUST remain immutable.
-- Security gate: no SECURITY DEFINER function is executable by PUBLIC,
-- and moneyverse_app cannot write financial/policy/lottery/arena tables directly.
-- Domain mutations require separately audited SECURITY DEFINER commands.
BEGIN;

-- All routines created since 233 must be corrected as well; default grants
-- alone are insufficient when a function is created by another DB owner.
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

DO $block$
DECLARE
  function_row record;
BEGIN
  FOR function_row IN
    SELECT pg_catalog.format(
      '%I.%I(%s)',
      n.nspname,
      p.proname,
      pg_catalog.pg_get_function_identity_arguments(p.oid)
    ) AS signature
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || function_row.signature || ' FROM PUBLIC';
  END LOOP;
END;
$block$;

-- App-accessible, audit-backed procedures keep their individually granted
-- EXECUTE permissions; these table DML privileges bypass the domain boundary.
REVOKE INSERT, UPDATE, DELETE ON
  public.pvp_wager_rooms,
  public.black_market_auctions,
  public.black_market_bid_logs,
  public.stock_league_seasons,
  public.stock_league_participants,
  public.copy_trading_subscriptions,
  public.ai_financial_diagnoses,
  public.central_bank_monetary_policy,
  public.citizen_lending_contracts,
  public.stock_advanced_orders,
  public.national_treasury_lottery_rounds,
  public.national_treasury_lottery_tickets,
  public.treasury_bond_repo_loans
FROM moneyverse_app;

-- Public treasury donation may be read, but direct INSERT is not a transfer
-- and cannot establish an idempotent balanced financial settlement.
REVOKE INSERT ON public.treasury_donations FROM moneyverse_app;

-- Migration 269 intentionally revoked this raw ledger primitive. Do not
-- re-grant it to moneyverse_app; all postings must use reviewed domain methods.
REVOKE EXECUTE ON FUNCTION
  public.economy_post_transaction(uuid, text, uuid, text, jsonb, text, jsonb)
FROM moneyverse_app;

COMMIT;
