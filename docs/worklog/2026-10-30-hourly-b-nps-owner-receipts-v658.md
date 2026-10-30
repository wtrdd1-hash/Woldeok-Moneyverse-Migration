# Backend B v658 — Owner-scoped NPS receipt reads

## Before work
- [x] Read AGENTS, README, EN/KO plans, open PRs, CI and QA v1387.
- [x] Verify Debian 13.6 and latest main 9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef.
- [x] Isolate branch auto/hourly-b-v658-nps-owner-receipts-20261030-1335 on stacked Draft #1992 (depends on Draft #1987).
- [ ] RED tests, implement forward-only migration 309, real PG ACL, exact-SHA checks.

## In progress
Pending RED test reproduction. No shared DB, service, financial or release changes.

## Finished
Pending validation. RELEASE HOLD.

## In progress — TDD and isolated PostgreSQL
- [x] RED: three focused tests failed on existing raw table queries/invalid input acceptance.
- [x] GREEN: three focused tests passed after switching repository to owner-scoped functions.
- [x] Added immutable forward-only migration 309; explicit REVOKE on both receipt tables, definer function owner, PUBLIC EXECUTE revoked.
- [x] Isolated PostgreSQL 17.11: direct SELECT/DML denied, scoped reads succeed, large integer exact, invalid inputs denied, historical rows unchanged; container removed.
- [ ] Full build, lint/typecheck, contract/database/security, Backend/Frontend full, exact-SHA CI/Test pending.

## Finished — candidate validation (RELEASE HOLD)
- [x] Source RED 3 failures / GREEN 3 passes; focused pension 15 PASS.
- [x] Isolated PostgreSQL 17.11: owner function EXECUTE, direct table ACL denial, 64-bit+ WLD precision, invalid input rejection, unchanged 2+2 receipt rows; container removed.
- [x] Lint PASS (0 errors, 1,043 warnings), Typecheck PASS, Backend/Frontend Build PASS.
- [x] Mobile app-api contract 183 endpoints PASS, Database static 58 PASS / 4 SKIP, Contract 41 PASS, security/release 25 PASS, production dependency audit 0 known vulnerabilities.
- [ ] Backend full: 2,568 PASS / 119 FAIL / 496 SKIP; Frontend full: 2,607 PASS / 53 FAIL. These failure counts match the pre-change QA v1387 baseline; individual failures are not certified unrelated.
- [ ] Full original migration-chain real PostgreSQL and authenticated official Test exact-SHA E2E: NOT RUN; isolated schema fixture is not equivalent.
- [ ] Parent PRs #1987/#1992 remain Draft/HOLD, and official Test serves an older SHA. No main merge or Production promotion.
- [ ] Account enrollment/getOrCreateAccount and admin-wide recent payouts still query raw pension tables; not addressed in this scoped change. Frontend C #1982 owns error/empty-state UI.

**Release:** BLOCKED. No shared database writes, ledger changes, service restart, or Production deployment.
