-- 275-pension-ledger-settlement-hold.sql
-- v2026.10.17.762
-- P0: 98 × 45 WLD paid to USER_CASH without a balanced Economy Core
-- posting between 2026-10-11 and 2026-10-15. Stop legacy payout,
-- refund and contribution writes at the application privilege boundary.
-- Do not fabricate backdated journal entries or move account balances.
-- The read-only account and historical receipt views remain available.
BEGIN;

REVOKE INSERT, UPDATE, DELETE
  ON TABLE public.national_pension_payout_logs
  FROM moneyverse_app;

REVOKE INSERT, UPDATE, DELETE
  ON TABLE public.national_pension_contributions
  FROM moneyverse_app;

REVOKE UPDATE, DELETE
  ON TABLE public.national_pension_accounts
  FROM moneyverse_app;

-- New zero-balance account enrollment remains possible for read-only portal
-- usage; it cannot contribute or begin paying until a new reviewed
-- idempotent, funded, double-entry Core transfer command is available.
COMMIT;
