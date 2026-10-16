-- v2026.10.16.722: P0 containment of unaudited certificate/order issuance.
-- Forward-only, ACL-only. No source WLD balances, ledger rows, customer data,
-- accounts, auth sessions, or emergency monetary freeze/unfreeze are modified.
--
-- The application code now holds policy proposal/approval and certificate
-- issue/retirement by default until reviewed SECURITY DEFINER Economy Core
-- settlement commands exist. Do NOT grant these direct table writes again.
-- Independent support for emergency freeze is intentionally preserved.
BEGIN;

REVOKE INSERT, UPDATE, DELETE ON TABLE
  public.monetary_policy_orders,
  public.mint_certificates,
  public.retirement_certificates
FROM moneyverse_app;

COMMIT;
