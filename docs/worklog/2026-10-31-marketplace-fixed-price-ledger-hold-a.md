# Development A — fixed-price marketplace ledger safety hold (2026-10-31 19:25 KST)

Status: **DRAFT / RELEASE HOLD**. Source `main@5bccda44d6db56aff05fa5623ef7f72b2ec0263c`.

## Before / root cause
- QA1419 P0 issue #2191: migration 232 `marketplace_create_listing` and `marketplace_buy_listing` directly mutate `account_balances` without ledger postings. This breaks auditability and double-entry guarantees. The auction bid path is owned separately by C Draft #2181.
- Browser fixed-price marketplace used seeded `INITIAL_MARKET_LISTINGS` and simulated successful sale/purchase via timers; this did not prove a durable DB transaction. Android app-api forwarded fixed-price mutation endpoints without a settlement hold.
- Existing DB `moneyverse_app` broad direct balance grants (#993) and official Test migration divergence (#2111) remain **separate P0 release blockers**.

## Change (safety mitigation, not a completed transaction feature)
- Immutable forward migration `314-marketplace-fixed-price-ledger-hold.sql`: replace the two money-mutating functions with unconditional SQLSTATE `55000` refusals and revoke `EXECUTE` from PUBLIC and `moneyverse_app`. No ledger writes, balance grants, migration rewrites or auction changes.
- NestJS fixed-price listing/purchase POST routes return `503` before calling the service. Preserve CSRF/session/consent guards and method signatures.
- Android app-api returns private, no-store, noindex RFC7807-style `503 marketplace_settlement_unavailable` without upstream fetch.
- Web fixed-price marketplace no longer seeds invented listings, no longer displays fabricated price-discovery statistics or wallet fallback, disables buy/sell actions and states that ledger settlement is unavailable. Crafting, auctions and direct trade are outside this narrow mitigation.

## TDD / verification
- RED before code: backend 2 failing assertions, Android 2 failing assertions, web assertion failing, SQL test missing migration. GREEN after code: backend targeted 7 PASS, frontend/app-api targeted 3 PASS, DB unit targeted 1 PASS.
- Isolated PostgreSQL 17.11 with `--network none`: 313/313 migrations applied; both functions reject with `55000`; app role `EXECUTE` denied; no ledger postings or transactions generated. Test container removed. This does **not** validate the divergent official Test database or Production.
- Initial full build failed with 1024 MiB Node heap OOM, not an application compile error; retried with 2048 MiB. Initial full test stopped on mobile contract drift caused by missing explicit return types; restored response contract with explicit `Promise<string|null>` return types. Bot initially lacked separately installed npm dependencies; recheck after installation.

## Release / rollback
- **NO MERGE, NO TEST/PRODUCTION DEPLOY** without final exact-SHA CI, Docker candidate, official isolated Test auth E2E, full PostgreSQL migration parity, least-privilege and independent backup restore evidence.
- Rollback is not editing 232 or 314. Re-enable only via a new reviewed migration with idempotent balanced ledger postings and receipts, preserving owner isolation and atomic rollback. No production rollback executed.
- All other developer branches, worktrees, PRs and reservations remain untouched.
