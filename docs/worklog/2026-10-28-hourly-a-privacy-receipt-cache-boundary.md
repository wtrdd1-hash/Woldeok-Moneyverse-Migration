# Engineering A — Privacy Request Receipt Cache Boundary (2026-10-28 03:25 KST)

## Before work
- Base main: b1cd54fda1123fb07ca81b6e5b3ead70f59f556c (fetch confirmed).
- Branch: auto/hourly-a-privacy-receipt-cache-20261028-0325, isolated worktree.
- Services: Debian 13.6; backend/frontend/bot/MCP/nginx/docker active, DB connected. Root 48%, data 67%.
- Starting remote non-main branches 364; open PRs 358, draft 343, conflicting 104, failed-check PRs 233, duplicate PR head SHA 0.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated planning master, previous A QA/release, open PRs including #1621 and QA #1610.
- P1 privacy gap: backend privacy GET/POST lack explicit private/no-store, Android gateway forwards upstream cache policy; private web page already dynamic/noindex and internal API fetch defaults no-store. Existing migration 015 owner functions must not be edited.
- Prior A/B/C/Gemini/QA branches and unmerged PRs are protected; no cleanup without proof of full integration.
- Current gates: baseline duplicate migration 283 and missing 285, existing blog lint failures, Bot critical/high audit, official Test exact-SHA unavailable; no merge or Production until fixed.
- Scope: privacy request receipt cache boundary across Backend/Next/Android API with existing PostgreSQL owner functions, without financial/DB migration writes.

## In progress
- [x] RED tests
- [x] GREEN implementation
- [ ] Isolated PostgreSQL and full regression
- [x] Midpoint main/planning refresh
- [ ] GitHub PR and CI

## Finished
- Pending evidence. Production RELEASE HOLD.

### Midpoint checkpoint — 03:31 KST
- RED confirmed: Backend header metadata 2 failures; Android gateway/privacy page 7 failures; middleware-before-guard 1 failure. GREEN: backend 4 PASS; frontend 25 PASS.
- Backend privacy controller adds private/no-store and noindex; module middleware runs before guards to protect 401/403; Next privacy page explicitly disables fetch caching; Android gateway overrides upstream public cache for privacy, and all generated gateway problems are no-store/noindex.
- Isolated PostgreSQL 17 applied original migration 015. Synthetic owner A list 1, owner B list 0, app-role direct-table SELECT denied: PASS. **Privacy create fails with SQL ambiguous created_at**, independent baseline blocker, not fixed by this HTTP cache change. No applied migration modified.
- QA #1610 handles migration lineage/blog lint, not migration 015 privacy function; preserve and do not duplicate its SQL. PR #1386 overlaps privacy frontend/controller and requires reconciliation.
- Main and integrated EN/KO plans re-fetched; main remains b1cd54fda1123fb07ca81b6e5b3ead70f59f556c.
- All Test/Production writes, deployments, financial changes and branch deletion remain forbidden.
