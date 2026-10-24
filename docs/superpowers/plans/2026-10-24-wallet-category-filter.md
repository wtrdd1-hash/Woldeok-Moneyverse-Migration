# Wallet activity category filter — bounded engineering brief (A1855)
Scope: owner-authenticated recent 50 ledger entries; categories all, rewards, transfers, banking, purchases, markets, other. The filter applies only to the newest 50, never claims lifetime coverage. No new ledger read, grants, schema, migrations or financial mutation. Existing recentTransactionsForUser(actor, 50) supplies the owner-scoped read, and WalletService.overview validates/filters canonical normalized rows. Backend GET /api/v1/wallet?recent=50&category=... returns 400 for invalid category. Next member-only /wallet/activity?category=... uses safe allowlisted query values, noindex, force-dynamic; Android app-api forwards query and sets private/no-store. Auth, consent and session guards unchanged.
Assumption: category is a user-facing convenience grouping by authoritative ledger type, not a tax/accounting classification. Unknown types are other. No amount is recalculated.
TDD plan:
1. Add failing backend tests for categories, unknown types, invalid input, last-50 boundary and owner query.
2. Implement category grouping/validation in wallet service/controller, keep default API unchanged.
3. Add failing frontend tests for allowlisted category link/query and noindex/no-store behavior; implement member UI.
4. Add Android gateway tests and response private/no-store; preserve session forwarding.
5. Verify focused tests, typecheck, lint, build, all tests, security, real isolated PG, CI; never merge/release unless every gate PASS.
Rollback: revert isolated PR, no schema/ledger changes.
