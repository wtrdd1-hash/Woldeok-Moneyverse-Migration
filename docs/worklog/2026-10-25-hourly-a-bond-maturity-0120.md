# A0120 — Verified virtual bond maturity overview

## Before work — 2026-10-25 01:20 KST
- System: Debian 13.6; backend/frontend/bot/MCP/Nginx/Docker active. No production mutations.
- Baseline: origin/main c9a868b1e622341e2daa8b936ddf0988eda9988e; remote branches 88 (including main), unmerged-unique branches 87, open PR 84. No deletion; protect other developers and Gemini.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, prior QA/worklogs and open PR/CI inventory. Planning backlog P0 ENV/SEC/REL remains blocking.
- Scope: P1 read-only bond maturity overview for a member. Existing bank_get_my_standing(uuid) supplies actor-scoped holdings; no new migration, direct table grant or ledger mutation.
- Approach: compute bounded verified per-bond maturity state, exact integer-string totals and explicit 7-day horizon; expose authenticated Nest endpoint, member noindex/no-store web page, Android app-api passthrough. No synthetic holdings.
- Alternatives rejected: client-only calculations (no canonical contract); new migration (unnecessary and collision risk); mutation/redemption (requires distinct idempotency and release QA).
- TDD RED→GREEN, regression, isolated real PostgreSQL ACL, full gates, exact SHA Test if feasible; otherwise Draft HOLD.

## In progress
- [ ] Backend tests RED then implementation GREEN.
- [ ] Frontend tests RED then UI GREEN; Android app-api contract regression.
- [x] Full verification and release gate evidence (FAIL/BLOCKED; release hold).

## Finished — 2026-10-25 KST
- Branch/PR: 88→89 remote branches (including main), 84→85 open PRs; Draft #1201. All 87 baseline non-main unique branches retained; 0 deletions; conflicting #1143/#1110/#1107 preserved.
- Files: Backend projection, controller and tests; frontend view/page/tests, bank link, app-gateway test; plan/worklog and EN/KO release reports. Feature SHA `7395020a54d6e94ff456e593ead82d5791470caf`.
- Full local gates: lint PASS, typecheck PASS, backend 1319 PASS/398 SKIP, database 15 PASS/3 SKIP, contract 38 PASS, frontend 1399 PASS/6 FAIL, bot 8 PASS, Webpack PASS, default Turbopack FAIL due external dependency symlink, app-api contract 179 PASS, prod audit 2 HIGH, full audit 2 CRITICAL/10 HIGH/11 MODERATE/3 LOW.
- Real PostgreSQL `woldeok_moneyverse_ci`: moneyverse_app bank_get_my_standing EXECUTE allowed, direct bond SELECT/INSERT and ledger INSERT denied; real active test member returned bonds array with 0 rows; read-only ROLLBACK. Not a positive-bond financial E2E.
- No merge, Test candidate promotion, Production deployment, DB write, service restart, rollback or branch deletion. Exact-SHA authenticated Test and security gates BLOCKED. Draft PR retained.
- Rollback plan: close unmerged Draft; no migration/data change. Any later merged code requires reviewed revert PR. Preserve all other workers' unique changes.

### Midpoint — 2026-10-25 01:25 KST
- `origin/main` re-fetched: still `c9a868b1e622341e2daa8b936ddf0988eda9988e`; integrated EN plan re-read. No overlapping open PR for bond maturity overview (bond mutation fix #1152 remains separate).
- Backend tests observed RED (missing method/module), then 6/6 GREEN. Frontend tests observed RED (missing component), then 16/16 GREEN after fixing ambiguous test locator and setting `NODE_ENV=test`.
- Implemented authenticated read-only Nest projection of existing `bank_get_my_standing` JSON; no SQL write or migration. Added private member route, 7-day/matured-unredeemed status, exact WLD strings, bank entry link, Android gateway route contract regression.
- [x] Backend tests RED then implementation GREEN.
- [x] Frontend tests RED then UI GREEN; Android app-api path contract.
- [x] Full verification and release gate evidence (FAIL/BLOCKED; release hold).
