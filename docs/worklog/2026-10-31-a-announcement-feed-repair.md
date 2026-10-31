# Development A — public announcement feed repair (2026-10-31 19:57 KST)

## Before work
- [x] Read `AGENTS.md`, `README.md`, English canonical `PROJECT_PLAN.md`, Korean translation, prior QA/worklogs, open PRs, branches and CI.
- [x] Origin main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`; 117 remote heads including main, 102 open PRs at start.
- [x] Isolated branch/worktree; do not alter other workers or their PRs.
- [x] Verified P1 gap: public Next BFF uses non-existent `/api/v1/content/announcements`, returns invented empty 200 on upstream failure; Android app API excludes `announcements` from route allowlist. Nest GET `/api/v1/announcements` already uses DB SECURITY DEFINER `content_list_published_announcements`.

## Plan / in progress
- [x] RED: add regression tests for wrong path, false-empty, malformed 200, Android route, and database function boundary.
- [x] GREEN: restore BFF and Android route with bounded validated public payload; no new migration, direct grants, or monetary writes.
- [ ] Verify exact SHA lint/typecheck/build/full tests, PostgreSQL function and app role, app-api and CI; review main again before integration.

## Finished
- Pending. Draft/HOLD until full release gates pass; no main merge or deployment without exact-SHA Test E2E and independent restore.

## In progress (20:00 KST)
- RED: frontend 5 failures (missing parser, wrong Nest path, false empty and missing Android route); Backend boundary 2 PASS.
- GREEN: frontend targeted 60 PASS, Backend boundary 2 PASS. Backend read remains on the existing SECURITY DEFINER function; no migration.
- Added Android path allowlist and method restrictions, fail-closed 503 on malformed 200. Awaiting full gates and isolated PostgreSQL.
