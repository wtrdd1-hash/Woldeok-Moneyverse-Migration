# B v756 — Bond administrator policy write boundary

## Before work
- [x] Read AGENTS.md, README, English/Korean plans, QA and open PRs, CI; fetched canonical main `a8541927c3a351d980454c66e95a3356c47e0722`.
- [x] Isolated branch and worktree; pre-existing dirty main checkout untouched.
- [x] Chose P1 uncovered administrator bond status/rate write; separate from #2458 member bond writes and #2419 P0 core ACL work.

## Plan (RED → GREEN)
- [x] Reproduce admin status PUT without CSRF and direct repository UPDATE bypass via HTTP and unit tests. RED: 5 FAIL / 1 PASS.
- [x] Enforce admin session CSRF and fail closed on uncertified bond policy writes at controller/service/repository boundaries.
- [x] Confirm unchanged read endpoints, typecheck, lint, builds, full suites and isolated PG; CI and Test exact-SHA are explicitly blocked/pending and no promotion is authorized.

## In progress
RED verified: 5 failures/1 passing: HTTP missing CSRF returned 200; authenticated status PUT returned 200; direct service and repository calls returned true and executed the mock query. GREEN: 6/6 new HTTP/unit tests, 35/35 bond focused regressions; contract build, backend typecheck/build and focused lint passed. No DB migrations or actual bond changes. Initial full local gates: backend 2982 PASS/2 FAIL/520 SKIP (existing profile 401), frontend 2922 PASS; workspace typecheck/lint/build PASS; contract PASS; DB 62 PASS/5 SKIP; prod audit 0, full audit 9 vulnerabilities. Isolated PostgreSQL 17.11: 322 migrations applied, 36 integration tests PASS, app direct treasury_bonds UPDATE and balance UPDATE/ledger DELETE denied. First remote CI runtime failed due existing coupon HTTP test module lacking a CsrfGuard override after adding class-level guard; repaired test harness (8/8 focused PASS, typecheck/lint PASS). New SHA needs CI and full gates.

## Finished — candidate only; RELEASE HOLD
- **Contract:** `PUT /admin/bonds/:id/status` and manual coupon `POST` require admin session + CSRF; missing/mismatched token returns 403. Valid policy PUT returns 503 with `BOND_POLICY_WRITE_HOLD_REASON` at controller/service/repository boundaries before SQL; no false 200. Existing admin read GET is unchanged. Bond status/rate mutation is **not implemented** pending DB-owned operator command and audit receipt.
- **RED → GREEN:** 5 failures/1 pass before code; new tests 6/6 and focused 35/35 PASS. Initial remote CI exposed missing `CsrfGuard` override in existing coupon HTTP test; repaired harness, both HTTP suites 8/8 PASS.
- **Final local SHA before this worklog commit:** `bc0973fc5dfd7f9d43f29db054ec6b99ce21f302`. Backend 2,984 PASS / 2 FAIL / 518 SKIP (existing profile HTTP 200-vs-401 failures, tracked separately in Draft #2265). Frontend 2,922 PASS. Workspace typecheck, lint (0 errors/1,027 existing warnings), build PASS. Contract 184 endpoints/683 methods PASS; DB package 62 PASS/5 SKIP; security/release 34 PASS. Production dependency audit 0; full audit 9 (8 moderate, 1 low).
- **Isolated real PostgreSQL 17.11:** 322 immutable migrations applied, 106 integration/auth/E2E/HTTP tests PASS; `moneyverse_app` direct `treasury_bonds` UPDATE, `account_balances` UPDATE and `ledger_postings` DELETE denied. Isolated container destroyed. This does not certify the live DB; QA v1466 found broad direct DML grants in the service-connected database and unresolved migration checksum issues.
- **Release gate:** exact-SHA official Test is still running `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, not this candidate. Full Backend failures, unresolved live DB ACL/checksum P0, independent restore and GitOps gates block integration and promotion. CI checks must be read against final SHA; initial runtime failure was test-harness injection, not certified green. Draft PR #2492 stays HOLD. No main merge, Test deployment, Production deployment, shared DB or ledger mutation, other-agent branch cleanup or schedule changes.
- **Sequence:** RED `afdb5cb6dfdcceb84285d0995dd8996f29334070` → GREEN `04e24ad23ab204f11ff81f7c3f30f68d12069d0d` → CI harness repair `bc0973fc5dfd7f9d43f29db054ec6b99ce21f302` → final worklog checkpoint. Source main `a8541927c3a351d980454c66e95a3356c47e0722` unchanged on repeated fetches.
