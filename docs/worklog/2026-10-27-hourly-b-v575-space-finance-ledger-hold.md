# Development B v575 — Space Finance Ledger Fail-Closed Containment (P0, DRAFT/HOLD)

**Date:** 2026-10-27 KST. **Start main:** `0fe614b2ca1a7bc0df540514e54db78130479e2a`. **Mid-run refreshed main:** `133c73b40d51b151523b8374508099f3d349415e` (SEO frontend + implementation plan only; no space files). **Branch:** `auto/hourly-b-space-finance-ledger-hold-v575-20261027-0835`. **Issue:** #1502.

## Evidence and one selected P0 defect family

Read `AGENTS.md`, `README.md`, English and Korean `docs/planning/PROJECT_PLAN*`, open PRs and active A/C/QA work, QA 1311 evidence and CI before editing. Debian 13.6 miniPC online; `/` has <1 GiB free, data disk ~11 GiB free. Three immutable SQL functions in applied migrations 223/231 directly update `account_balances` and insert `ledger_transactions ON CONFLICT DO NOTHING`, without balanced `ledger_postings`: `space_purchase`, `city_project_contribute`, `space_pay_property_tax`. SQL idempotency and double-entry guarantees are not proven. **No historical balance loss is asserted.** A/C are not working on these three Backend Repository methods; C #1220 changes the space UI.

## Actual code and API contract

- `backend/src/space/space.repository.ts`: remove the three unsafe SQL invocation paths; throw `SpaceFinanceLedgerHoldError` before any DB command. Authenticated `POST /api/v1/spaces/purchase`, `POST /api/v1/spaces/city/projects/:id/contributions`, `POST /api/v1/spaces/:id/tax/pay` now return HTTP 503 `{code: "SPACE_LEDGER_SETTLEMENT_UNAVAILABLE", message: ...}` when DTO/guards succeed. No success receipt or WLD movement. Keep space holdings, city-project progress, layout, tax status and unrelated reads intact.
- `backend/src/space/space-finance-ledger-hold.test.ts`: six new unit/service regression cases, including no DB query and preserved reads. TDD initial RED 4 / GREEN 6.
- `backend/src/space/space-finance-ledger-hold.db.test.ts`: one real PostgreSQL 17.11 disposable-container test with executable synthetic legacy mutation functions and marker table; all three Repository calls return 503 and marker remains 0. Container removed. DB test skips without `SPACE_HOLD_TEST_DATABASE_URL` in ordinary unit runs.
- No migration or existing SQL checksum edited. Main migrations are contiguous through 279; other unmerged PRs propose migration 280. Adding a competing migration would violate the numbering/release gate. **DB functions and app-role DML remain executable in deployed databases; this is Backend-only containment, not a complete DB repair.**

## Verification (before rebase, re-run on final candidate required)

- Targeted Vitest: 16/16 PASS; real isolated PostgreSQL: 1/1 PASS.
- Typecheck: PASS; ESLint: 0 errors / 1,131 pre-existing warnings; full Build: PASS.
- Full `pnpm test`: initial 115-second timeout (not a product assertion); re-run PASS: Backend 1,332 PASS / 399 SKIPPED; Frontend 1,423 PASS; contract 38 PASS; database package 15 PASS / 3 SKIPPED. Discord Bot 8/8 PASS after installing its dependencies.
- Full pnpm audit: **FAIL** (2 critical / 8 high / 11 moderate / 3 low); bot audit: **FAIL** (1 critical / 5 high); production-only audit PASS. Security gate remains **FAIL**.
- Official Test exact-SHA, authenticated user flow, DB app-role ACL, migrations/backup restore and GitOps: **BLOCKED / NOT PERFORMED**. No Test or Production deployment, no merge, no branch cleanup.

## Follow-ups / strict release HOLD

P0 #1502: forward-only SQL ledger-first repair or DB-level fail-closed + app DML revocation, immutable actor/payload receipt, 100-concurrent disposable PostgreSQL replay and rollback, migration-number conflict resolution, checksum parity #1469. Existing `/spaces` UI omits required UUIDs for purchase and city contribution and must show a truthful disabled/retry state (coordinate with C). Do not promote until full security audit, required CI, authenticated official Test exact-SHA and GitOps release gates PASS. Do not modify or disable A/C/QA/planning/this automation.
