# v682 start/intermediate audit
- User authorized Treasury remediation and safety-gated Production promotion. Operator used miniPC MCP.
- Latest main 8356146e157080704e157b3203e38599baec68ff, merged reviewed v678 changes in isolated branch fix/treasury-db-authority-v2026.10.15.682 without changing other agents' checkouts.
- Confirmed operational SWF switch false at 15:18 KST with last execution 14:47, zero new FEE_RECIRCULATION. Initial backup 20261015T055103Z confirmed present; Production services active.
- Restored financial Test DB wdmv_treasury_v680 (isolated) has 266 historical migration rows; applied 269–271 in Test only. Direct donation function 269 runtime failed SQLSTATE 42703 on invalid ledger_transactions.tx_type (inside rolled-back transaction). Under migration 271 moneyverse_app cannot SELECT vaults or journal; current v678 direct reconciliation query fails. Thus Production rollout is not accepted from CI alone.
- New v682 purpose-scoped privileged reconciliation SQL design, negative role checks and source test to follow. No Prod schema, personal balances or software pointer changed.

## Intermediate gate / 2026-10-15 15:27 KST
- Production SWF remained OFF; last execution 2026-10-15T05:47:57Z. The next hourly execution must still be checked.
- The restored Test database correctly refuses direct vault/journal SELECT to moneyverse_app under 271. v678 code's direct SELECT would fail at runtime despite passing mocked/CI tests.
- A red-only read-boundary regression (packages/database/verify/treasury-admin-reconciliation-v682.sql) failed as expected because no narrow \`treasury_admin_reconciliation(uuid)\` exists. No new financial migration was applied or production release staged.
- Standalone Production release still blocked by missing secured read functions, broken 269 donation function, broad legacy direct-balance disbursements and Test release identity/schema mismatch.
