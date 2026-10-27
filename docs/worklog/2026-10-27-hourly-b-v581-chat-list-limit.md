# Backend B v581 — Private chat list/search limit contract (2026-10-27)

## Start (12:32 KST)
- Canonical `origin/main`: `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`.
- Isolated branch `auto/hourly-b-chat-list-limit-v581-20261027-1230`, worktree `/srv/moneyverse-data/build-workspaces/mv-b-v581-20261027-1230`.
- Read AGENTS.md, README.md, English canonical `PROJECT_PLAN.md`, Korean companion, latest QA v1315 and PRs. Main is unmodified.
- P1: private chat conversation list and recipient search silently partially parse or clamp invalid `limit` (e.g. `2junk`, `1e2`, 0, oversized), changing the requested scope. Affected routes: `GET /api/v1/chat/conversations`, `GET /api/v1/chat/search-users`.
- Related overlapping work: PR #1465 modifies chat message bigint cursors, but not these two limit handlers; PR #1429 handles frontend recipient search. Preserve both, coordinate in PR.
- Invariants: existing session/auth/consent, actor-scoped SQL, read-only queries, no WLD/ledger writes, no applied migration changes.

## Checklist
- [x] Inspect live miniPC and latest source/QA/PR/CI, select independent issue.
- [ ] RED: add controller regression tests and prove failure before implementation.
- [ ] GREEN: strictly validate decimal page sizes (1..100 conversations, 1..20 search), reject malformed/multiple/unsafe values before any read.
- [ ] Verify focused/full tests, lint, typecheck, build, app-api, security, real isolated PostgreSQL and CI exact SHA.
- [ ] Refresh main and plans at midpoint and before any merge; no merge or deploy without all gates.
- [ ] Record internal and GitHub final result and protect other agents' work.
