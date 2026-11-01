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
- Planned: strict query parser, Nest web/Android endpoints, shared published snapshot filtering, Next accessible search form, Android response verification, regression tests, contract update.
- Status: NOT YET IMPLEMENTED.

## Finished
- Pending evidence. Production and Test must remain unchanged.
