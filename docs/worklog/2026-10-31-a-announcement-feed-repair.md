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

## In progress (20:13 KST) — full-gate root cause and repair
- First combined pnpm test: EPIPE due to shared MCP cgroup process pressure, not a passing run. Backend limited-workers attempt also encountered a worker process error; frontend full suite found one genuine regression: the app group allowlist test had not been updated for announcements.
- Updated the allowlist contract test. Added a server-side strict boolean pin check (no coercion of string "false"), plus regression tests.
- Security review found that a structurally valid upstream object could carry untrusted extra fields. Both Next BFF and Android now return only explicitly verified published fields; Android enforces 60-second public cache maximum and noindex on success, 503 no-store on unavailable upstream, GET-only collection.
- Final targeted GREEN: frontend/Android 80 PASS, Backend 8 PASS. First local full build PASS, production-only dependency audit PASS. Exact final SHA full gates will be rerun after this commit.
- Development PostgreSQL 17.11 read-only function execution PASS (1 published result counted, ROLLBACK). Existing DEV app-role direct DML privileges remain P0 #993; no changes to grants or migration.
