-- v1410.3 P0 financial DB least privilege: remove legacy direct writes.
-- Required by the read-only Production financial readiness gate.
-- Monetary changes must use migrator-owned, actor-scoped SECURITY DEFINER
-- functions and audited balanced ledger receipts, never raw app DML.
-- This migration ONLY changes grants, not account balances or ledger entries.
-- Apply after 285; all 283/284/285 changes are forward-only and immutable.
BEGIN;

REVOKE INSERT, UPDATE, DELETE ON TABLE
  public.account_balances,
  public.accounts,
  public.system_treasury_vaults
FROM moneyverse_app;

DO $$
BEGIN
  IF has_table_privilege('moneyverse_app', 'public.account_balances', 'INSERT')
    OR has_table_privilege('moneyverse_app', 'public.account_balances', 'UPDATE')
    OR has_table_privilege('moneyverse_app', 'public.account_balances', 'DELETE')
    OR has_table_privilege('moneyverse_app', 'public.accounts', 'INSERT')
    OR has_table_privilege('moneyverse_app', 'public.accounts', 'UPDATE')
    OR has_table_privilege('moneyverse_app', 'public.accounts', 'DELETE')
    OR has_table_privilege('moneyverse_app', 'public.system_treasury_vaults', 'INSERT')
    OR has_table_privilege('moneyverse_app', 'public.system_treasury_vaults', 'UPDATE')
    OR has_table_privilege('moneyverse_app', 'public.system_treasury_vaults', 'DELETE')
  THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'moneyverse_app still has direct financial DML after revocation';
  END IF;
END;
$$;

COMMIT;
