# Hourly A1725 — Verified stock trade history CSV export

## Before work
- 2026-10-25T17:20:45+09:00 Debian 13.6 miniPC direct MCP: backend/frontend/bot/mcp/nginx/docker ACTIVE; root 95% / data 57%. Database connected; no Production writes authorized.
- Fetched authoritative main **1c5b84a1c45baafcca83f375a6f99698121e9bb5**; read AGENTS.md, README.md, living project plans and integrated EN/KO master, previous A1648 QA, open PRs, branches, and CI. Original requested root PROJECT_PLAN files live under docs/planning/.
- Remote branches **168**, open PRs **164**. Preserve all other worker branches, Draft PRs and unique commits. Existing #1107/#1110/#1143 conflict history preserved. Zero deletions.
- Isolated branch **auto/hourly-a-stock-history-csv-20261025-1725** from main, worktree **/srv/moneyverse-tasks/hourly-a-stock-history-csv-20261025-1725**. Previous A1648 pension 42501, 6 frontend failures and security audit are known release blockers; this task does not touch pension or other workers' scopes.
- P1 user flow: owner-only CSV export of recent virtual stock trades. Existing backend /api/v1/stocks/history -> SECURITY DEFINER stock_my_trades(actor, limit) provides exact bigint text and owner filtering. New bounded query parameter, secure private CSV route, Android query forwarding/no-store, formula injection hardening. No new migrations, WLD writes, or external exports.

## In progress
- [ ] TDD RED tests for backend bound/auth, CSV exact precision and injection, private app-api.
- [ ] Implement backend query, web CSV export and app-api privacy headers.
- [ ] Run focused, full and real-PG/CI gates; capture exact SHA and release blockers.

## Finished
- Pending.

### Mid-task checkpoint
- RED backend 10/10 expected failures (missing bounded history), frontend import failures for missing serializer/route; recorded in `/srv/moneyverse-data/a1725-{backend,frontend}-red.log`.
- GREEN backend **10 PASS**, frontend/API/Android **17 PASS**. Bounded 1..100 history, server-authenticated CSV, spreadsheet formula shielding, exact integer strings, private app-api and attachment headers. Source DB function `stock_my_trades(actor,limit)` unchanged.
- Main and living English master re-fetched; no new main SHA. No migration or WLD writes.
- [x] TDD RED tests for backend bound/auth, CSV exact precision and injection, private app-api.
- [x] Implement backend query, web CSV export and app-api privacy headers.
- [ ] Run focused, full and real-PG/CI gates; capture exact SHA and release blockers.
