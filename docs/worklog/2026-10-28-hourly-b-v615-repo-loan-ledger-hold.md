# Backend B v615 — Treasury bond repo-loan ledger containment

## Before work — 2026-10-28 20:40 KST
- [x] Confirm Debian 13.6 miniPC and service status via miniPC tools; storage 98% used.
- [x] Fetch `origin/main` (`35971c600f25869c96f1c666d4b9f58927202730`) and read `AGENTS.md`, `README.md`, both planning files, QA v1348, PR/CI inventory.
- [x] Confirm issue #1151: `createRepoLoan` directly credits USER_CASH and `repayRepoLoan` directly debits USER_CASH without authoritative ledger postings. Earlier broad containment PR #1152 is CLOSED; active B #1736 only holds subscription.
- [x] Create independent v615 branch/worktree. No live database writes, migrations, branch cleanup or deployment.

## In progress
- [x] TDD RED: HTTP borrow/repay must return 503 before service access; consent/CSRF guard metadata; service and repository reject before any SQL; owner read route remains.
- [x] GREEN: remove unsafe repo-loan WLD mutations at controller/service/repository boundaries.
- [x] Verify focused tests, backend tests, typecheck/lint/build as capacity permits; re-fetch main and planning.

## Finished
- [x] Record tests, candidate SHA and release HOLD; PR/CI status follows in GitHub.

**Scope:** source-level fail-closed containment only. No ledger-backed repo-loan implementation or database privilege repair. Existing repo-loan records remain unchanged. Frontend/Android must display unavailable state before a complete user-flow release. Existing automated bond coupon settlement remains a separate P0 risk.

## Midpoint — 2026-10-28 20:46 KST
- RED: 12 failures / 13 cases in focused HTTP/service/repository test; 503 guards absent, direct SQL reachable.
- GREEN: 18/18 focused + existing service tests pass; HTTP, service and repository reject both mutations before SQL.
- Re-fetched origin/main and reread planning. Main remains `35971c600f25869c96f1c666d4b9f58927202730`.

## Finished — 2026-10-28 20:50 KST
- Implementation checkpoint: `2f59734a5e7e195da1650a6f5644f8734d867566`; lint correction: `a0da58f9f5031ee1b39727202d3ed0e9d01562cc`.
- RED 12/13; GREEN focused 18/18 after lint correction. Backend 1,952 PASS / 440 SKIPPED; DB package 46 PASS / 4 SKIPPED; backend build, root typecheck, API contract (180 endpoints), full lint (0 errors, 1,099 warnings), security advisory floor (9), bot tests (11) PASS.
- Initial full lint failed on a new test variable named `module`; renamed to `testingModule`, then reran focused tests and full lint successfully. Initial bot test lacked linked node_modules; reran with existing read-only dependency symlink and passed.
- Production dependency audit FAIL: `qs@6.16.0`, Moderate GHSA-6pq8-jhm2-2vcw. Frontend full tests/build and complete root test were not run: shared data disk 98% full and concurrent workers must be protected. Real PostgreSQL full-schema, authenticated E2E and official Test exact-SHA not certified.
- Re-fetched main and both plans: `35971c600f25869c96f1c666d4b9f58927202730` unchanged. Test `/api/version` is `cfb13272beea53c4d8c20eff7f379b6f66343033`; Production is `unknown`.
- **Release HOLD:** Draft PR + hold; no merge, Test deployment, Production deployment, DB writes, branch cleanup, or changes to A/C/QA/planning automations. The source hold cannot protect deployed environments until an authorized release.
- **Next:** C/A must expose honest unavailable UX in web/Android; a new SQL migration must implement balanced, atomic, owner-bound, replay-safe borrow/repay before re-enabling. The separate automated coupon/maturity direct-balance path remains P0.
