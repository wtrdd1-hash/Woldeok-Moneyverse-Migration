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
- [ ] Verify targets, typecheck, lint, build, full suites, real PostgreSQL and CI; record exact SHA.
- [ ] Recheck main, preserve other work, create Draft PR only; no release without official Test exact SHA, security and rollback.

## Midpoint (19:26 KST)
- Rechecked main unchanged. Real PostgreSQL 17.11 `moneyverse_app` read-only SQL PASS, 1 published notice / 0 pinned, positive multi-row case unverified. Transaction ROLLBACK.
- Existing P0 direct grants observed: announcements SELECT, account_balances UPDATE, user_items DELETE. No DB writes or privilege changes.
- Full suites, build, lint and CI still pending.

## Finished
- Pending evidence.
