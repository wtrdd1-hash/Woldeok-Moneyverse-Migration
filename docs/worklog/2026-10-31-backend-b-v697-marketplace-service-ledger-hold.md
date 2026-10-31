# B v697 — Marketplace Service Financial Settlement Hold

## Before work
- Baseline: `origin/main` 5bccda44d6db56aff05fa5623ef7f72b2ec0263c.
- P0 #2191: migration 232 marketplace listing fee, purchase and auction bid directly update balances without double-entry ledger postings. Source is callable from `MarketplaceService` even if a controller adds a hold.
- Distinct scope: service-layer fail-closed guard only. A #2192 owns fixed-price controller and forward migration; C #2181 owns auction controller/UI. Preserve both; no SQL migration, WLD write, or new endpoint.
- State: IN PROGRESS. Release HOLD.

## Planned verification
- [x] RED service-level tests reject listing creation, purchase, auction bid before pool queries, proxy state or websocket events.
- [x] GREEN code changes to MarketplaceService, no controller or migration edits.
- [x] Run local tests, lint, typecheck, build and isolated PostgreSQL; record unavailable exact-SHA gates.
- [x] Record SHA, CI status, Test/Production status, audit and coordination; preserve RELEASE HOLD.

## In progress — 21:06–21:17 KST
- RED: new service test 4 FAIL / 1 PASS on main; listing and purchase reached SQL, auction bid returned success-shaped output, null pool returned a generic error.
- GREEN: service-level `requireLedgerBackedSettlement()` is invoked before SQL, proxy bid state and broadcasts. Service tests 6 PASS, Nest HTTP tests 3 PASS; 100 concurrent replay attempts yielded zero SQL or broadcasts.
- Focused lint and Backend typecheck PASS. Code SHA `87654d0ab3abe4fa9b9ba5419e10245d31462e89` pushed; Draft/HOLD PR #2204 created.
- Remote CI at initial SHA exposed `@next/next/no-assign-module-variable` in the new HTTP test; changed `module` to `testingModule`, re-ran focused lint/tests PASS, pushed `973e7d17cb46a9dead2ea9260c71d62cac6b4df7`. This is an actual test-only correction, not a security policy waiver.
- A #2192 and C #2181 notified; neither branch/worktree modified. Main and English/Korean project plans rechecked at mid-run, unchanged.
- Release HOLD: no SQL function EXECUTE revoke in this branch, no official Test exact-SHA, no authorized merge or Production promotion.


## Finished — 21:21 KST (code candidate verified, release still blocked)
- Baseline and final `origin/main`: `5bccda44d6db56aff05fa5623ef7f72b2ec0263c` (no advancement). Verified code SHA `973e7d17cb46a9dead2ea9260c71d62cac6b4df7`; Draft/HOLD PR #2204. Final docs-only commit will not alter the service code.
- Authoritative `mv-task` local gate exit 0: root `pnpm test` PASS (contract 41; database 62 PASS / 4 SKIP; Backend 2,795 PASS / 501 SKIP; Frontend 2,776 PASS), lint PASS (0 errors, 1,049 pre-existing warnings), typecheck PASS, full build PASS, mobile API contract check and included security/storage tests PASS.
- Focused TDD: RED 4 FAIL / 1 PASS; GREEN service 6 PASS and Nest HTTP 3 PASS. All 100 concurrent/replay attempts rejected with zero SQL or WebSocket broadcasts.
- Fresh disposable network-isolated PostgreSQL 17.11: 312 canonical migrations applied; app role cannot UPDATE account_balances, identities or audit_logs, cannot DELETE ledger_postings, and cannot EXECUTE three unsafe marketplace functions on this **fresh** DB. Initial SQL negative probe used a nonexistent account_balances column; corrected the **test script**, reran all 312 migrations and received `ISOLATED_PG_PASS`. Container removed. This is not evidence that shared DEV or Production grants match; QA #993 reports DEV drift.
- Production dependency audit PASS (0 known advisories). Full dependency audit **FAIL: 13 vulnerabilities (10 moderate, 3 low)**.
- GitHub CI initial code SHA `87654d0...` failed on new HTTP-test variable `module` (Next lint rule); corrected at `973e7d1...`, focused tests/lint PASS and remote CI restarted. Full remote CI still in progress at the time of this entry.
- Official Test and Production `/api/version` both `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not the candidate or main. No candidate exact-SHA authenticated Test/E2E, financial reconciliation, independent restore or GitOps release gate PASS.
- Coordination: A #2192 fixed-price controller/forward SQL migration, C #2181 auction controller/UI, and B #2200 FX scoped reads remain independent. A and C PR comments record service-layer dependency. Multiple Draft migrations reserve number 314; integration must reconcile without modifying applied SQL.
- **PARTIAL / BLOCKED:** service-level code implementation verified; direct shared-DEV SQL privilege drift and authoritative ledger settlement remain unresolved. No main merge, Test deploy, Production promotion, runtime restart, shared DB/WLD mutation or branch cleanup. All existing scheduled workers preserved.
