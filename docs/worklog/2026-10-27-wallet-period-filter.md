# Wallet ledger rolling-period filter — Development A / HOLD

Start: 2026-10-27 11:29 Asia/Seoul. Base main `5888176454648f51d5f986be60a22847bd234777` (refresh before integration).

## Scope and acceptance
- [ ] RED tests: strict period values `7d`/`30d`/`all`, reject unknown values; owner-bound SQL period filtering BEFORE LIMIT; large WLD strings unchanged.
- [ ] Backend GET `/api/v1/wallet?recent=50&period=7d|30d|all` keeps owner-scoped session guards, bounded results and balances; default remains all.
- [ ] Frontend `/wallet/activity?period=` provides 7/30-day and all-history-window navigation, explicit 50-entry ceiling, private noindex/no-store.
- [ ] Android app-api forwards the query unchanged through existing allowlisted wallet gateway, with regression evidence.
- [ ] Tests: focused unit, DB read on isolated PostgreSQL, backend/API, app-api, frontend, typecheck/lint/build/security/CI; no merge without all PASS.

No migration or financial write: uses existing owner-scoped ledger read SQL and current DB schema. Do not run tests against shared development/Production DB. Distinct from unmerged PR #1160 (category filters). Release HOLD, no Test/Production promotion until full gates.

## Checkpoints
- Start: main, AGENTS, README, bilingual project plan, QA v1313 and current PRs inspected; root 100% and data 98% risk.
- Mid: pending.
- End: pending.

## Mid checkpoint — 2026-10-27 11:34 KST
- RED: backend 3 tests failed and frontend period helper missing; then GREEN: backend 3/3, frontend period/app-api 13/13.
- Backend/frontend typecheck PASS after correcting exactOptionalPropertyTypes and Vitest spy typing.
- Focused ESLint PASS; backend full unit 1329 PASS / 398 SKIP (no DATABASE_URL), frontend full 1426 PASS.
- SQL owner filter and rolling window are applied before LIMIT; no schema changes, no ledger writes. Existing app-api gateway forwards the query and has regression coverage.
- Existing PR #1160 category filters remain untouched. All release gates remain HOLD pending isolated PostgreSQL, full build/security, exact-SHA Test and GitOps.
