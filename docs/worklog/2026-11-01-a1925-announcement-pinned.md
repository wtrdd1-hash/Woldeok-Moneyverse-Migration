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
- [ ] Recheck main, preserve other work, create Draft PR only; no release without official Test exact SHA, security and rollback.

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

## Finished
- Pending exact-head verification and PR closeout.
