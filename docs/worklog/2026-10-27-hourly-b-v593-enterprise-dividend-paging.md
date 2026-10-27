# Backend B v593 — Admin SOE dividend history paging

**Start:** 2026-10-27 23:34 KST · **Base main:** `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`
**Branch:** `auto/hourly-b-enterprise-dividend-log-limit-v593-20261027-2335`
**Worktree:** `/srv/moneyverse-data/build-workspaces/mv-b-v593-enterprise-dividend-log-limit`

## Source-backed defect
`GET /admin/enterprises/dividend-logs` previously forwarded a truthy `Number(limit)` to the service, and the repository passed that value to SQL `LIMIT $1` without a bound. A malformed/duplicate query could become a non-integer, zero could silently default, and an excessive limit could trigger a large read. No production impact or unauthorized access was established.

## Implemented contract
- Omitted limit: 20; accepted canonical decimal strings: 1 through 100.
- Malformed, repeated, fractional, exponent, negative, zero, unsafe, excessive or non-string values: HTTP 400 before service/database.
- Repository validates direct numeric callers (safe integer 1–100) before PostgreSQL.
- Existing admin guards, endpoint, response rows and parameterized SQL retained.
- No DB migration, DML, ledger, WLD, or Production/Test changes.

## TDD evidence and verification
- RED: 23 failing assertions, 8 passing, before production code change.
- GREEN: 31/31 controller/repository cases; HTTP 2/2; combined focused 35/35.
- Isolated PostgreSQL 17.11: 3/3 using synthetic readonly data; 1/2/100 row bounds, bad limits rejected, UPDATE denied SQLSTATE 42501. Ephemeral container removed.
- Backend: 1,577 PASS / 415 SKIPPED. Frontend: 1,485 PASS. Contract: 38 PASS; 179 API schema endpoints.
- Typecheck PASS; ESLint 0 errors / 1,122 pre-existing warnings.
- Initial local build failed because symlinked dependencies escaped the Turbopack workspace root. After isolated offline `pnpm install --frozen-lockfile`, default build PASS.
- Bot: 8/8 PASS after isolated offline install.
- Root `pnpm test` FAIL on existing duplicate migration 280 and missing 282 (not caused by this PR).
- Dependency audit FAIL: 24 total (2 critical, 8 high, 11 moderate, 3 low); bot audit FAIL: 6 (1 critical, 5 high).

## Hold
GitHub CI and exact-SHA official Test must be evaluated separately. Until every required gate is green, keep Draft + hold, do not merge, do not promote Production. No other worker's branch/worktree or automation setting was modified.
