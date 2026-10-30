# P0 — Critical application-role ACL release gate (v675)

## Evidence and design

QA v1404 observed broad DEV `moneyverse_app` table grants despite the SECURITY DEFINER boundary. The existing read-only financial release gate checks only INSERT/UPDATE/DELETE on five financial tables; PostgreSQL TRUNCATE is a separate privilege and private identity/audit/inventory tables are absent. This is a release-evidence gap, not proof of a Production compromise.

**Options:** (A) revoke grants in DEV/Production immediately (unsafe: unreviewed operational mutation and existing owner acceptance); (B) change the financial gate to certify those privileges (incorrect); **(C) extend the read-only gate to fail closed on unwaived private SELECT/DML/TRUNCATE and financial TRUNCATE** (chosen). Do not modify applied migrations, DB roles, or live balances. Operator acceptance of existing DML on accounts, account_balances and system_treasury_vaults does not waive TRUNCATE or private-table privileges.

## Implementation sequence

1. Isolated main worktree, fresh QA/PR comparison and source review.
2. RED: new Node tests for omitted private tables, TRUNCATE, malformed grants and snapshot SQL.
3. GREEN: extend `verify-financial-readiness.mjs` query, validation, fail-closed blockers and aggregate-only summary. Preserve existing DML blockers and the `READ ONLY REPEATABLE READ` transaction.
4. Run focused/release tests, lint, typecheck, build, backend/frontend/database/contract/security tests and isolated PostgreSQL 17.11 proof; read DEV ACL without mutation.
5. Draft/HOLD PR only. No merge, Test or Production until complete exact-SHA GitOps release gates and independent provenance/restore checks.

## Regression boundaries

Do not grant/revoke any permission in a shared DB. Do not include session tables in the private deny-all list: the documented auth session layer legitimately has narrow direct writes. Preserve ledger immutability and WLD. New gate is a prerequisite, not an assertion that the environment is ready for release.
