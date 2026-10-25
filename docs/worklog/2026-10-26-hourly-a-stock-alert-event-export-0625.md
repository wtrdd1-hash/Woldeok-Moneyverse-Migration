# Development A / A0625 — Private Stock Alert Trigger Event CSV

## BEFORE WORK — 2026-10-26 06:18 KST
- MiniPC Debian 13.6 connected via pc MCP: backend, frontend, bot, MCP, nginx, Docker active; database connectivity reported, **live production-connected DB is not a test fixture**. Root 99% (about 1 GiB free), data disk 73%; worktree is on data disk.
- Authoritative GitHub `main` / `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; recheck at mid and pre-integration. Read `AGENTS.md`, `README.md`, English `docs/planning/PROJECT_PLAN.md` / Korean counterpart, English and Korean integrated planning master; latest planning Draft #1379 is not merged. QA #1317 contains separate frontend/security fixes and must not be duplicated.
- Start audit: 229 remote heads, 225 open PRs (including other agents); recent A #1377 weekly quest CSV, #1373 business holdings CSV, #1372 loan CSV. Conflicted #1107/#1110/#1143 and all unproven unique changes preserved. No deletion.
- Separate branch `auto/hourly-a-stock-alert-events-csv-20261026-0625` created from latest main in `/srv/moneyverse-data/build-workspaces/a0625-stock-alert-events-csv`.
- P1 user gap: `/stocks/alerts` displays only 30 recent stock alert trigger events and has no download; Nest owner-only `stock_alert_events_list(actor, limit)` already limits to 100. Add a **recent 100 maximum** private CSV, not all-time history, not a real trade or WLD settlement receipt.
- Scope: session-bound Nest snapshot GET, existing PostgreSQL SECDEF read, same-origin Next CSV with full response validation/formula escaping/precision, keyboard link and truthful bilingual text, Android app-api private/noindex parity, regression tests and schema reference. No DB migration or ledger write.
- RED→GREEN tests first. All gates mandatory, including exact-SHA official Test; never merge or deploy on partial evidence. Rollback: discard unmerged branch; later deployment would revert read-only endpoint and UI via reviewed commit.

## IN PROGRESS
- [ ] TDD RED: backend owner/scope and frontend CSV, guest/privacy, Android tests.
- [ ] GREEN: implement API/Next/Android contract/UI.
- [ ] Recheck main, planning, open PRs and other agents.
- [ ] Validate isolated real PostgreSQL ACL and full test gates.

## FINISHED
- Pending final QA/release/CI/branch audit.
