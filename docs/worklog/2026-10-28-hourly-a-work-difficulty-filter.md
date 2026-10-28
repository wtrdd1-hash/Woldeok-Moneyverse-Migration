# A1725 Work task difficulty filter — worklog (EN canonical)

## Before — 2026-10-28 17:26 KST
- MiniPC Debian 13.6 reachable; backend/frontend/bot/MCP/nginx/Docker active, development DB connected.
- Main `35971c600f25869c96f1c666d4b9f58927202730`; read AGENTS, README, EN/KO integrated project plans, QA v1344/v1345 and open PRs/CI. Fresh isolated `auto/hourly-a-work-difficulty-filter-20261028-1725` worktree from main.
- Data disk 97%; production release blocked by 18,000 WLD ledger drift, broad app DML privileges, missing exact-SHA Test, unapplied/checksum-mismatched migrations and unverified independent restore. Do not modify existing data, migration, releases or other workers' worktrees.

## During — 17:33–17:44 KST
- TDD RED recorded: backend 22 failing / 1 passing, frontend 16 failing / 29 passing. GREEN: backend focused 52 passing, frontend focused 45 passing.
- Implemented canonical `difficulty=1..5` on authenticated `GET /api/v1/work/tasks`, SQL predicate after owner-scoped `work_task_board($1)`, existing no-filter contract unchanged. Member web `/work` SSR GET filter with accessible select; Android `/app-api/v1/work/tasks` forwards the query and enforces `private, no-store`/`noindex` even on error.
- Synthetic isolated PostgreSQL 17.11: 4 PASS (owner isolation, other-user negative, 64-bit integer-string preservation, direct app-role table SELECT/DELETE denied). Ephemeral container removed; this is not a full production schema or authenticated official Test proof.
- Contract build and 180-endpoint Android API check PASS; typecheck PASS after fixing a newly added test typing issue; full lint PASS (0 errors, 1099 pre-existing warnings). Backend full 1964 PASS / 444 SKIP. First root full-suite run TIMEOUT at 150 seconds; duplicate retry terminated to preserve resources, no other workers touched. Frontend full 1,888 PASS before the extra UI regression; 2 accessible UI tests then PASS. Database 46 PASS/4 SKIP, Bot 11 PASS after isolated offline dependency install, root security 23 PASS, production audit High+ 0 (1 Moderate). Frontend build first failed due artificial 1 GiB Node heap cap; retry with 2 GiB heap PASS. Root aggregate exact-final-SHA rerun pending.

## Finish / release decision
- Draft PR only until full CI and official Test release gates pass. No migration, payout, ledger, DB grant, production data, branch deletion or deployment. Preserve all incident recovery refs. Worktree and evidence logs retained for reproducibility.
- Existing Work task reward projection uses floating point in `net_reward` (not changed by this read-only filter); do not treat preview as authoritative settlement evidence. Official Test and Production release HOLD.
