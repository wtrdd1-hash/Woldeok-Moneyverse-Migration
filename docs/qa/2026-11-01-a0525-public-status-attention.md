# A 05:25 Status Attention — QA Evidence (In Progress)

- Scope: read-only status attention filter on Nest, Next, Android app-api and existing PostgreSQL SECURITY DEFINER function.
- TDD: backend 2 and frontend 4 RED then GREEN; targeted backend + frontend 27 PASS.
- DB: DEV PostgreSQL 17.11, role `moneyverse_app`, `content_public_status()` 3 rows, attention 0, transaction ROLLBACK; not a synthetic outage scenario.
- Typecheck PASS; lint 0 errors / 1,022 existing warnings.
- Full test/build, exact-SHA CI, Test E2E, backup restore and release proof pending. **RELEASE HOLD.**

## Final local evidence and blockers
- Frontend full: 557 files, 2,907 PASS / 0 FAIL. Backend targeted 6 PASS, new HTTP 2 PASS; backend full 2,950 PASS / 517 SKIP / 2 baseline FAIL (same failures on pristine main). Repair #2265 independently reaches backend 2,950 PASS / 517 SKIP.
- Database package: 62 PASS / 4 SKIP. Shared contract: 41 PASS. Typecheck/build PASS; lint 0 errors/1,022 warnings; production dependency audit no known vulnerabilities; app API contract 184 endpoints, generated artifact parity PASS.
- DEV PostgreSQL `moneyverse_app`: read-only function 3 rows, ROLLBACK; source tables direct SELECT and snapshot UPDATE are permitted, P0 ACL FAIL (#993). No synthetic outage DB proof or full DB migration replay in this cycle.
- Combined feature + repair backend rerun stopped by Vitest worker EPIPE. This is NOT a passing full suite.
- Candidate SHA not installed in official Test or Production; no authenticated E2E or independent restore; exact final SHA CI and Docker candidate pending. **Do not merge/promote.**
