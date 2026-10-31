# Backend B v711 — Wallet and ledger HTTP response privacy

## Before work
- Baseline main: f13bbce273ffc65e8576170992d82ea00c27a1c9.
- P1 scope: authenticated wallet balances, ledger activity, transfer receipts, and bank/reward operations in WalletController can respond before method-level `@Header` decorators execute (SessionGuard, ConsentGuard, CsrfGuard). These responses must not inherit public cache/robots/referrer policies.
- Existing draft PRs B #2273 banking, B #2277 activity telemetry, B #2255 chat, B #2207 profile are distinct controllers. No DB, ledger or economic writes.
- Plan: write actual Nest HTTP failing regression for success and guard failures; add middleware to WalletModule scoped to WalletController; re-run focused and full gates; hold merge and release unless all required gates and exact-SHA Test pass.
- State: IN PROGRESS.

## In progress
- RED: 10/11 actual Nest HTTP assertions failed before fix (guard rejections missing all headers; success responses missing robots/referrer). Resource saturation initially caused EAGAIN; taskset 0-1 restored a valid test run.
- GREEN: 11/11 HTTP assertions pass with WalletController-scoped pre-guard middleware; unrelated public route unchanged.
- No API payload, authn/authz, database, migrations, WLD or ledger changes.
- Main rechecked: f13bbce273ffc65e8576170992d82ea00c27a1c9.

- Full workspace typecheck: PASS. Full workspace lint: PASS (0 errors; 1,022 pre-existing warnings).
- Full backend/frontend tests, build, isolated PostgreSQL, and exact-SHA Test remain pending; RELEASE HOLD.
