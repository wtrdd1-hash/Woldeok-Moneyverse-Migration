# A 2026-11-01 19:25 KST — P1 published notice pinned-only discovery

## Before work
- Main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`; isolated `auto/hourly-a-20261101-1925-announcement-pinned`; main checkout has another actor's `implementation_plan.md` change, untouched.
- Read AGENTS.md, README.md, English canonical and Korean secondary `docs/planning/PROJECT_PLAN*.md`, recent QA/worklogs, open PRs and CI.
- Initial remote refs 125 (main plus 124 non-main), open PRs 114 (22 conflicting), 117 unmerged non-main, 7 ancestor. Preserve all without explicit proof of safe deletion.
- P1 gap: pinned announcements are marked in the public feed but visitors cannot select only pinned notices. Backend already exposes `is_pinned` via `SECURITY DEFINER` public list. Avoid DB migration or direct table grants.
- Scope: `?pinnedOnly=1` on latest 20 published announcements only; preserve public visibility, original ordering and default behavior. GET-only; invalid/duplicate/unknown query -> 400; mobile gateway must reject false filtered HTTP 200; filtered result no-store/noindex. No financial writes.
- Risks: existing A announcement date/image Draft PRs edit same files; do not overwrite their unmerged changes. Feature is isolated and release HOLD until all gates pass.

## In progress
- [x] RED backend + Android + frontend tests (3 backend + 3 frontend fail before implementation; logs retained).
- [x] Implement backend SQL wrapper, service, public and app controllers, web filter, Android gateway. Target 3 backend + 4 frontend PASS; both typechecks PASS.
- [x] Verify targets, typecheck, lint, build, full suites, real PostgreSQL; final exact-SHA CI and E2E pending.
- [x] Recheck main, preserve other work, create Draft PR #2362 with hold label; no release without official Test exact SHA, security and rollback.

## Midpoint (19:26 KST)
- Rechecked main unchanged. Real PostgreSQL 17.11 `moneyverse_app` read-only SQL PASS, 1 published notice / 0 pinned, positive multi-row case unverified. Transaction ROLLBACK.
- Existing P0 direct grants observed: announcements SELECT, account_balances UPDATE, user_items DELETE. No DB writes or privilege changes.
- Full suites, build, lint and CI still pending.

## Finalization in progress (19:37 KST)
- Web refactored to a dedicated `/announcements/pinned` route, retaining the original `/announcements` metadata/canonical and avoiding query-param opt-in to dynamic rendering. Filtered route has noindex and canonical to the base list.
- Web and Android fail closed for unfiltered success-shaped upstream responses. Backend service uses only existing SECURITY DEFINER function and an outer WHERE; no migration or direct grants.
- Full Backend: 2,964 PASS, 2 FAIL (existing profile HTTP 401), 518 SKIP. Frontend with NODE_ENV=test: 2,906 PASS on earlier code; final SHA re-run pending. Without NODE_ENV=test initial frontend run failed 496, corrected by environment.
- Build backend/frontend PASS before last web helper; full lint 0 errors/1,022 warnings, DB unit 62 PASS/4 SKIP, Android API contract 184 endpoints PASS, security 11 PASS.
- Real DEV PG READ ONLY/ROLLBACK: 1 published, 0 pinned; positive fixture not verified; P0 broad grants remain.
- QA and release HOLD documents recorded. CI/Test/Production gates outstanding.

## Finished (19:43 KST)
- **Code SHA** `c2f74533089bcfa6c589636e68007a3b28e6366e`, base main unchanged `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`; Draft/HOLD PR #2362; 18 changed tracked files. Main checkout's unrelated local modification untouched.
- **Final code SHA gates:** Backend full 2,965 PASS / 2 FAIL / 518 SKIP (existing profile 401); Frontend full 2,907 PASS with NODE_ENV=test; Backend and Frontend build/typecheck PASS; full lint 0 errors/1,022 warnings; DB unit 62 PASS/4 SKIP; app API contract 184 endpoints PASS; advisory security 11 PASS. Target backend 4 PASS, frontend/Android 5 PASS. Earlier incorrect NODE_ENV frontend 496 FAIL was rerun correctly, not claimed PASS.
- **Real DEV PG:** function execute true, published 1, pinned 0, exact parameterized SELECT PASS; READ ONLY/ROLLBACK. Positive pinned fixture missing. P0 app-role ACL (announcements SELECT, balances UPDATE, items DELETE) persists. Production ACL not checked.
- **CI:** code SHA CI #41298689388 and candidate build #41298309505 IN PROGRESS at 19:43 KST, not certified. Official Test public SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16`; Production backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; neither matches candidate. Auth E2E, rollback, independent restore, accessibility browser checks and GitOps gates BLOCKED.
- **Branch/PR audit:** initial 124 non-main remote refs (117 unmerged/7 ancestors), 114 open PR (22 conflicts); final 125 non-main (118 unmerged/7 ancestors), 115 open PR (22 conflicts). No deletion: unmerged commits protected; ancestors retained pending ownership review. Existing A announcement PRs and other agents' changes protected.
- **Test/Production:** no deploy, no migration, no DB writes, no restart, no GitOps promotion, no rollback action; Production HOLD. Unmerged candidate rollback is non-integration. Full rollback requires independent artifact and GitOps proof.
