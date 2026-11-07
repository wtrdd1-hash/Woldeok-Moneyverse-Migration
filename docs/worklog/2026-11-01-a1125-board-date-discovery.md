# A 2026-11-01 11:25 — Recent public board date discovery

## Start — P1 / isolated candidate
- Scope: date-bound discovery for the latest 50 publicly visible board posts, without claiming historical search or exposing private posts.
- Baseline: `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`; 75 remote refs and 72 open PRs at initial audit (subject to concurrent changes).
- Guardrails: use existing `SECURITY DEFINER` public projection, bind all SQL values, no migration or privilege changes, do not touch existing worktrees or other agents' branches.
- Plan: RED tests for ISO date validity and duplicate/unknown query parameters; service SQL date bounds; web form and SEO; Android gateway validation and response verification; real PostgreSQL read-only and full gates.
- Release: HOLD until exact SHA CI, authenticated isolated Test and GitOps evidence are green. No Production changes.

## Checkpoints
- [x] Inspect current main, policies, living plan, recent QA, PRs and CI.
- [x] RED regression tests.
- [x] Backend/SQL, frontend and Android gateway implementation.
- [x] Targeted tests, actual PostgreSQL read-only evidence, build, lint, typecheck, security and API contract.
- [ ] Full Backend/Frontend suites: worker EPIPE and host cgroup task exhaustion; cannot count as PASS.
- [x] Midpoint and pre-integration main/plan refresh; Draft PR #2304 and HOLD report.
- [ ] Final exact-SHA CI and authenticated Test E2E; release HOLD.

## Midpoint — implementation and regression evidence
- Added canonical Gregorian day validation and half-open Asia/Seoul date bounds to the existing latest-50 `SECURITY DEFINER` public board projection; no schema or permission changes.
- Web adds accessible date filter and rejects unverified `appliedDay` echo; Android gateway rejects duplicate/unknown/invalid day inputs, and rejects stale HTTP 200 responses without the exact applied day and row-level timestamp proof.
- RED confirmed backend 7 failing/new cases and frontend 5 failing/new cases; GREEN: backend 25/25 and frontend 7/7 targeted tests passed.
- Re-fetched origin/main and both living plans at midpoint. No plan file changed in this worktree. Release remains HOLD.

## End — verified candidate and release HOLD (2026-11-01 11:41 KST)
- Branch: `auto/hourly-a-20261101-1125-board-date`. Main start/mid/pre-integration SHA: `f13bbce273ffc65e8576170992d82ea00c27a1c9` (unchanged). Latest editable planning v1598 was read from Draft #2301 in English and Korean; no planning changes made.
- Sequential commits: `1799f91` start log → `c8693b8` feature → `f8a6178` web verification test → `702606b` test deduplication → `54e0cef` generated Android contract; final report commit follows.
- RED then GREEN targeted Backend 25/25; Frontend/Android/title 16/16. Exact SQL on real PostgreSQL as `moneyverse_app`: Seoul 2026-09-18 positive=1, adjacent=0, future=0; transaction ROLLBACK.
- Backend and Frontend build PASS (603 static pages), workspace typecheck PASS on final feature code, lint 0 errors/1,022 warnings, DB unit 62 PASS/4 SKIP, security 11 PASS, dependency audit 0 known vulnerabilities, generated Android contract 184 endpoints and drift check PASS.
- Full Backend and Frontend Vitest fork-pool runs both ended with worker `EPIPE` before a trustworthy suite summary; the thread-pool retry was terminated **only for this task** when `moneyverse-mcp.service` reached 1,015/1,027 cgroup tasks and GitHub CLI failed to create OS threads. Services remained active and task-group count fell to 974. These full suites are **NOT PASS**; avoid further resource-heavy retries on this host until capacity is restored. Unchanged-main QA v1435 separately reports two administrator console frontend failures; repair PR #2303 owns them.
- P0 development DB ACL persists: `moneyverse_app` direct `account_balances UPDATE`, `user_items DELETE`, `users SELECT` all true; documented on issue #993. Production ACL was not assessed.
- Test public version `bc8cd8a6c654...`, Production public version `353c6d5d6ddb...`; neither matches the candidate. Exact SHA Test auth E2E and GitOps rollback gate are BLOCKED; Production promotion forbidden.
- PR #2304 remains DRAFT/HOLD. Other board PRs #2280/#2286 overlap files and require semantic conflict review before integration. No main merge, Test/Production deploy, DB writes, service restarts, branch deletion or runtime rollback. All unique unmerged branches preserved.
- Starting remote refs 75 including symbolic origin and main (73 non-main), open PRs 72. At 11:40 audit: 75 non-main branches all carrying unique commits, 74 open PRs, zero main-conflicting PRs. Concurrent agent additions may change counts after this snapshot.

## Modified files (functional, generated and worklogs)
`backend/src/board/stock-community.controller.ts`, `backend/src/board/stock-community.service.ts`, both associated HTTP/service tests, `frontend/src/app/board/page.tsx`, `frontend/src/app/board/board-day.ts`, `frontend/src/app/board/board-day.test.ts`, `frontend/src/app/app-api/v1/[...path]/route.ts`, `frontend/src/app/app-api/v1/[...path]/board-day.test.ts`, `docs/mobile-api-contract.json`, `docs/mobile-api-schema-reference.md`, `docs/mobile-api-schema-reference.ko.md`, and this English/Korean QA/worklog set.
