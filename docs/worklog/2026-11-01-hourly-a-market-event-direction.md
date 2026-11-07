# Development A worklog — 2026-11-01 09:25 KST

**Start:** Debian 13.6 miniPC services active; DEV PostgreSQL 17.11. Base main `f13bbce273ffc65e8576170992d82ea00c27a1c9`. Main checkout already had unrelated uncommitted `implementation_plan.md`; protected it by using new `auto/hourly-a-20261101-0925-market-event-filter` worktree. 64 remote heads, 62 open PRs; no branch deletion.

**Implementation:** Added optional strict direction query to stock controller/service/repository, SQL predicate over `stock_market_events_active()`; public `/newspaper/events` All/Up/Down UI; newspaper navigation; Android app-api invalid-filter and stale HTTP-200 rejection; unit/HTTP/UI/gateway tests. No DB migration, grant, ledger or money mutation. Initial failing tests documented in task evidence, then focused GREEN. First full Next build SIGABRT, retry with one static worker passed.

**Mid:** Refetched main and plans; main unchanged. Real DEV role read-only source checks 3 up/0 down. Two full Frontend failures were reproduced against untouched main and retained as blockers. DEV app-role P0 direct DML persists. No overlap with open market-event feature PR titles; all unique existing remote branches preserved.

**End:** Candidate draft only; full Backend 2960 PASS/517 SKIP; Frontend 2904 PASS/2 FAIL + worker error; DB unit 62 PASS/4 SKIP; API contract 184 PASS; security 10 PASS; typecheck, lint (0 errors), single-worker build PASS. Official Test and Production remain at older SHA. No merge, deployment, restart, branch cleanup or rollback. Evidence under `/srv/moneyverse-data/tasks/mv-a-20261101-0925-market-event-filter/evidence/`.

**GitHub end:** Draft PR #2293; 65 remote heads / 63 open PRs, zero deletions or merges. Initial code SHA `0ec87cf3d55ab669699f6e7da4b0146c00a000d6`; final documentation SHA recorded in PR. Exact SHA CI pending.

**V3 after PR review:** Found that an empty legacy unfiltered HTTP 200 could pass Android validation. Added source echo `appliedDirection` and required it on both web and Android even for empty results. TDD RED 2+2, GREEN 12+7; Backend full 2962 PASS/517 SKIP. Frontend full retry aborted EPIPE; earlier 2 baseline failures remain. Initial constrained build failed due rayon thread resource limits, retry with RAYON_NUM_THREADS=1 PASS. Full lint 0 errors after renaming test variable. New SHA will be recorded in PR. No release.

**V4:** `pnpm api:contract:check` exposed response-schema union flattening drift. Fixed typed optional response and regenerated mobile contract/EN/KO references. Focused Backend 12 and Frontend 7 PASS, typecheck PASS. Final exact SHA and CI status in PR #2293.
