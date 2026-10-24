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
- [ ] Full verification and release gate evidence.

## Finished
- Pending.
