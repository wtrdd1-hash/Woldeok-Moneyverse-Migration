# Backend B v618 — Pension retirement state mutation boundary

## Before work
- [x] Read AGENTS, README, canonical English/Korean plan, QA v1351, open PRs and CI.
- [x] Verify latest main and independent worktree; live DB and other workers untouched.
- [x] Scope: only `POST /api/v1/pension/toggle-retire` and its Next BFF, not the already-held NPS financial settlement paths.
- [ ] TDD RED: prove missing Nest CSRF/consent and BFF same-origin checks.
- [ ] TDD GREEN: require session, authentication, current consent, CSRF, and same-origin browser request; forward fresh session CSRF server-side.
- [ ] Verify focus tests, workspace lint/typecheck/build/test, isolated DB, CI and Test exact-SHA as available.

## In progress
- Risk: the public NPS state toggle currently mutates user retirement status without explicit CSRF guard; its Next route forwards an unauthenticated browser POST through a session-bound backend API. Reject cross-origin at the browser edge before minting a server CSRF token.
- Preserve read-only pension views and existing successful same-origin user flow; do not change WLD balances, payout holds, or migrations.

## Finished
- Pending verification. Production HOLD.

## Implementation checkpoint
- [x] RED: Nest HTTP test missing/invalid CSRF returned 201 instead of 403; missing consent returned 201 instead of 428 (2 failures). Next BFF rejected neither cross-origin nor missing-origin requests (2 failures, upstream mock error returned 500).
- [x] GREEN: Nest real `CsrfGuard` + `ConsentGuard` HTTP 3/3 PASS. Next same-origin BFF 2/2 PASS, including missing/cross-site Origin denial and server-side CSRF mutation helper.
- [x] No database, migration, wallet or retirement business-logic changes. Other pension finance mutation paths remain separately held/unchanged.
- [ ] Full gate evidence and final SHA validation pending.

## Finished — 2026-10-28 23:43 KST
- [x] Final implementation: Nest `POST /pension/toggle-retire` requires current consent and session CSRF; Next BFF validates same-origin browser request before using `mutate()` to spend a fresh server session token. Private/no-store BFF response. No ledger/DB/migration change.
- [x] Full Backend tests: 1,942 PASS / 440 SKIPPED (no live PG). Database package: 46 PASS / 4 SKIPPED. API contract: 180 endpoints PASS.
- [x] Focused Nest HTTP: 3 PASS; Next BFF: 2 PASS. RED before implementation: Nest 2 failing and BFF 2 failing. Security advisory-floor policy: 9 PASS.
- [x] Workspace Typecheck PASS; Backend Build PASS; root Lint PASS with 0 errors / 1,098 warnings after test-only reserved-identifier fix.
- [ ] Full Frontend tests: FAIL, 1,431 PASS / 402 FAIL (113 failed files). This is a release blocker, not a green gate.
- [ ] Production dependency audit: FAIL, 1 Moderate `qs@6.16.0` (tracked by QA Draft PR #1687).
- [ ] Full Next.js build and isolated real-PostgreSQL/full-schema test not run: shared miniPC data disk 99% used, no isolated Test exact-SHA environment prepared. Do not run on live Production-connected development DB.
- [ ] Final candidate CI and Build Test Candidate incomplete at this checkpoint. Official Test `/api/version` = `cfb13272beea53c4d8c20eff7f379b6f66343033`, not candidate.
- [x] Draft/HOLD PR #1755, no merge, deployment, DB mutation, service restart, branch cleanup, or automation setting change.
- [x] Main stayed `35971c600f25869c96f1c666d4b9f58927202730` through pre/mid/pre-closeout checks. Code SHA `d6cb9c8bca80fa90f1aef5e6b929d74c43a42d9f`, lint-fix SHA `9468d05239ab6a9947e474ce45b4da80907e1b86`.

**Release decision: PARTIAL / BLOCKED. Production HOLD until every mandatory gate is independently green.**
