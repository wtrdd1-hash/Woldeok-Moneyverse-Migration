# B v589 — Strict administrator pension payout history pagination

## Before work
- [x] Connected to miniPC Debian 13.6; inspected service status, AGENTS.md, README, English/Korean living plans, QA v1322, open PRs, CI and main.
- [x] Starting main: `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`. Branch: `auto/hourly-b-pension-payout-paging-v589-20261027-1935`. Isolated worktree.
- [x] P1 reproduction: `GET /api/v1/admin/pension/recent-payouts?limit=0` silently selected the default 20; malformed or excessive limits reached SQL, risking misleading pension payout audit results and unbounded queries.
- [x] Scope separated from PR #1173 (manual pension payouts), #1307 (owner reads), #1499 (pension UI), and #1564 (migration parity). No payout mutation or migration.

## In progress
- [x] TDD RED: 21 failed, 8 passed across 29 tests before implementation.
- [x] Controller now accepts omitted limit (default 20) or canonical decimal integer 1–100; rejects malformed, repeated, fractional, exponential, zero, negative, leading-zero, unsafe, and over-limit input with HTTP 400 before service access.
- [x] Repository rejects direct invalid numeric limits before SQL. Existing admin/session/consent guards and success response remain unchanged.
- [x] GREEN: 29/29 focused unit tests and 2/2 Nest HTTP integration tests; typecheck PASS.
- [x] Isolated PostgreSQL 17.11: synthetic prepared SELECT LIMIT 1/2 returned exact row counts; readonly role UPDATE rejected, table unchanged; isolated container removed. This is not full production-schema or authenticated official Test E2E.
- [x] Code and worklog pushed to independent branch; Draft PR #1569 with hold label.
- [x] Mid-work main re-fetched and unchanged.

## Finished / verification
- [x] Final focused tests: 31/31 PASS.
- [x] Backend tests: 1,575 PASS / 412 SKIPPED.
- [x] Frontend tests: 1,485 PASS; contract tests: 38 PASS; API contract: 179 endpoints consistent.
- [x] Typecheck PASS; ESLint 0 errors / 1,122 existing warnings; full default build PASS; Discord bot 8/8 PASS after offline dependency install.
- [x] Repository security, control-byte and Prisma migration guards PASS; production dependency audit PASS.
- [ ] Root `pnpm test` and database package suite FAIL on **pre-existing duplicate migration 280** in main; independent Draft #1564 addresses this but is not merged. Do not edit applied migrations or another worker's branch.
- [ ] Full dependency audit FAIL: 2 critical / 8 high / 11 moderate / 3 low; bot audit FAIL: 1 critical / 5 high.
- [ ] Initial CI on pre-lint-fix SHA failed (new test variable `module` violated Next lint rule); renamed to `testingModule`, re-ran focused/full tests and lint. Final SHA CI status must be checked separately.
- [ ] Official isolated Test exact-SHA authenticated finance/API/DB E2E, full migration parity, security gate and approved GitOps release: BLOCKED.
- [x] No main merge, Production deployment, DEV/Production DB write, WLD mutation, or other worker branch/worktree deletion. Draft + hold until all gates pass.

## API/DB contract
- GET /api/v1/admin/pension/recent-payouts: omitted limit => 20; canonical decimal 1–100 => HTTP 200 and existing array response; malformed or duplicate limit => HTTP 400. Existing admin/session authorization remains.
- Repository direct calls: only safe integer 1–100; invalid values rejected before SQL. No schema changes or migrations.
