# A 18:25 — Published announcement image-only discovery (worklog)

## BEFORE WORK
- Main SHA: 1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0 (fetched at start); isolated branch: auto/hourly-a-20261101-1825-announcement-image; separate worktree: /srv/moneyverse-data/tasks/mv-a-20261101-1825-announcement-image/repo.
- Scope: P1 read-only filter for image-attached notices among the latest 20 already-published announcements, across Nest API, PostgreSQL function read, browser and Android gateway. No migration or WLD writes.
- Existing Draft #2347 filters publication day and Draft #2272 filters pinned notices. Keep both untouched; overlapping announcement files require review before merge.
- Safety: reject duplicate/unknown filter parameters, fail closed on unverifiable Android 200, noindex/no-store for filtered results. Preserve default public SSR and published-only DB boundary.
- Plan: [ ] write failing tests [ ] implement API/DB read [ ] implement web [ ] implement Android verification [ ] verify full gates [ ] audit and release decision.

## IN PROGRESS
- Worktree initialized, no main checkout edits. Production and Test unchanged.

### RED checkpoint
- Backend three new tests failed as expected; frontend/Android ten new tests failed as expected (missing parser, unsupported filter, no Android validation). Logs: task/evidence/backend-red.log and frontend-red.log.
- Revised Android path to existing `/app-api/v1/content/announcements` (not unregistered `/announcements`) and added app content controller coverage before implementation.

### GREEN checkpoint
- Backend 3/3 and Frontend/Android 12/12 targeted tests PASS after RED (evidence in task/evidence).
- Implemented bounded PostgreSQL function-result filter, both Nest controllers, web GET checkbox and noindex, Android gateway strict query/proof/no-store.
- No migrations, table grants, ledger writes, Test or Production changes.
- Midpoint main re-fetched before gate execution; source SHA unchanged at this checkpoint.

## FINISHED — local implementation, release gated
- TDD RED→GREEN completed. API/DB/browser/Android feature and tests committed; API contract EN/KO updated. No schema migration or ledger writes.
- Full test suites passed under `NODE_ENV=test`: Backend 2,966 PASS/518 SKIP; Frontend 2,914 PASS (before new SSR 3-test file); database unit 62 PASS/4 SKIP. Typecheck PASS, builds PASS, lint 0 errors/1,022 warnings, security 12 PASS, Android contract 184 PASS, prod dependency audit no known vulnerabilities. See QA for initial environment-induced failures and final SHA retest.
- Real DEV PostgreSQL `moneyverse_app` exact parameterized SQL: 1 latest published notice, 0 image-attached, READ ONLY / ROLLBACK. Existing P0 #993 app-role ACL violations remain.
- Official Test/Production SHA mismatch; exact-SHA Test authenticated E2E and independent restore not certified. Draft PR/HOLD, no merge or deployment. Preserve all other branches and PRs. GitHub CI must be checked against the final SHA.
- No Test/Production changes, no service restarts, no DB writes, no branch deletions, no rollback.
