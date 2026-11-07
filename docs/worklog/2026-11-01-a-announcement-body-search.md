# Development A — published announcement body search (2026-11-01)

## Before work — 21:26 KST
- Debian 13.6 miniPC verified through Moneyverse MCP and remote command; backend, frontend, bot, nginx, Docker, PostgreSQL DEV connected.
- Canonical origin/main: `3d5e321c3d1221febff677469fecdfcb3cf42e7d` (fresh fetch and ls-remote).
- Start inventory: 139 remote branches including main; 126 open PRs. Existing overlapping announcement drafts #2243 (title), #2347 (day), #2359 (image), #2362 (pinned), #2377 (sort) retained. No branch deletion.
- Read AGENTS.md, README.md, English/Korean PROJECT_PLAN, integrated master, latest planning Draft #2375, prior A QA/worklog, open PR and CI lists.
- Branch `auto/hourly-a-20261101-2125-announcement-body`, isolated worktree `/srv/moneyverse-data/tasks/mv-a-20261101-2125-announcement-body/repo`.
- P1 scope: body-only keyword search of existing bounded 20-row published announcement snapshot; no full archive search, no private content, no database migration or ledger writes. Existing SECURITY DEFINER function is the sole read source. Independent from existing title search draft.
- Risk: app gateway must reject malformed query and unverified upstream 200, no-store/noindex on filtered responses and errors. Existing full release P0 #993 and exact-SHA Test/restore remain blockers.
- Process: TDD RED -> implementation GREEN -> full local gates -> fresh main recheck -> PR; no merge/deploy without release gates.

## In progress
- Planned: strict body-only query parser, Nest web/Android endpoints, shared published snapshot filtering, Next accessible search form, Android response verification, regression tests, contract update.
- RED evidence: backend and frontend Vitest fail to import missing announcement-body module; logs evidence/red-backend.log and evidence/red-frontend.log at 21:29 KST. Tests were written before implementation.
- Mid-run main SHA rechecked: `3d5e321c3d1221febff677469fecdfcb3cf42e7d` unchanged. Latest planning Draft #2375 remains unmerged and is not runtime authority.
- Implementation: bounded body-only case-insensitive search via existing published SECURITY DEFINER read, strict Nest and Android query validation, separate /announcements/body noindex web route, Android stale-200 rejection. No migrations or direct table grants.
- TDD GREEN: Backend 4/4; frontend initial 6/6; additional non-JSON/204 Android RED reproduced and fixed, final target 7/7.
- Full local backend 2,974 PASS / 518 SKIP, frontend 2,910 PASS before the additional Android non-JSON guard; final targeted Android tests 7 PASS. Database 62 PASS / 4 SKIP. Typecheck, builds, full lint (0 errors / 1,027 warnings), API contract (184 endpoints), security (10 PASS) succeeded. Final exact-code-SHA frontend rerun: 2,911 PASS / 0 FAIL; backend exact-code-SHA: 2,974 PASS / 518 SKIP. All skipped tests remain unverified, not PASS.
- Real DEV PostgreSQL read: published function EXECUTE=true for app role, one published notice, zero matching `서버`; DEV app role direct announcements SELECT=true violates least privilege P0 #993. No write.
- Next build still marks canonical /announcements dynamic, as in preceding A build; it retains its original revalidate=60 and no-searchParams behavior. Search-only route is explicitly dynamic/noindex. No claim that canonical is statically prerendered.
- Status: code complete, awaiting final verification, PR, exact SHA CI, official Test/Production gates.

## Finished — 21:55 KST closeout
- Source code SHA `f14c9b99b87a25b7cd73c0be338202267123565c` on isolated `auto/hourly-a-20261101-2125-announcement-body`, Draft PR #2380. 15 changed code/test/planning/worklog files versus base main; no migrations, ledger changes, DB writes, or new grants.
- Exact-code-SHA backend full 2,974 PASS / 518 SKIP; frontend full 2,911 PASS; database unit 62 PASS / 4 SKIP; targeted backend 4 PASS, frontend 6 PASS (additional Android non-JSON negative case included); typecheck, backend/frontend builds, Android contract 184 endpoints, security 10 PASS, full lint 0 errors / 1,027 warnings. Full evidence in `/srv/moneyverse-data/tasks/mv-a-20261101-2125-announcement-body/evidence/`. Skips and warnings are not PASS.
- Real DEV PostgreSQL `moneyverse_app` read-only transaction: published function EXECUTE permitted, one published row, zero matching sample rows, ROLLBACK. No positive matching real-row case; unit tests cover positive filter. DEV `announcements` direct SELECT remains an unresolved least-privilege P0 (#993); Production DB not inspected.
- End audit: origin/main `3d5e321c3d1221febff677469fecdfcb3cf42e7d` unchanged; remote branches 142 including main (start 139), open PRs 129 (start 126), 28 conflicting PRs; 132 remote tracking refs have unmerged commits (may include stale refs). Preserve all branches, especially overlaps #2243, #2347, #2359, #2362, #2377. Deleted 0.
- Final CI `runtime-check` and candidate build on code SHA were still running at closeout; no claim of CI PASS. Official exact-SHA Test/authenticated E2E, independent backup restore, P0 DEV ACL and GitOps release gates are not satisfied. Draft PR #2380 remains HOLD. No main merge, Test/Production deployment, service restart, production DB modification, rollback, or branch deletion. Rollback if later needed: revert feature commits; no schema rollback.
- Docs-only closeout commit will change this worklog and bilingual QA/release reports; the code-SHA full local tests remain applicable to unchanged executable files, while the final documentation SHA requires its own CI evidence before integration.
