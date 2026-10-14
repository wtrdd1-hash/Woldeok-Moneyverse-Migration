# Database and backend optimization — v2026.10.14.622

## Before work — 2026-10-14 KST

- Approved scope: research PostgreSQL database performance and improve database/backend maintenance safely; keep canonical ledger and balances unchanged.
- Exact starting `origin/main`: `c56af867ad8f7556e53f895b0bb294c4bfc8a02d` after `git fetch origin main`.
- Dedicated branch/worktree: `perf/database-backend-optimization-v2026.10.14.622`, `.worktrees/db-opt-v622`.
- Read `AGENTS.md`, `DOCS_INDEX.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/DATABASE_ARCHITECTURE_SPEC.md`, `docs/operations/database-migrations.md`, `docs/architecture/database-security.md`, `docs/RELEASING.md`, existing database research v486, and applicable worktree/TDD/verification skills.
- Live read-only DEV DB baseline: PostgreSQL 17.11; total database 957 MB; `user_activity_logs` 424 MB, `outbox_events` 213 MB (46,941 estimated dead rows), `virtual_stock_price_ticks` 105 MB (88,554 rows older than 24 hours), `virtual_stock_minute_candles` 71 MB.
- Scheduler source has unbounded daily DELETE statements for stock ticks and delivered outbox events; review bounded retention without changing protected monetary data.
- `main` is concurrently modified by other agents. Do not edit the shared main worktree, modify existing applied migrations, delete balances, or rewrite another agent's branch.
- Evidence references: PostgreSQL VACUUM/ANALYZE documentation, query planner/index guidance, and current project architecture rules.

## In progress

- [x] Confirm host, DB connection, version, disk pressure and table/index statistics.
- [x] Check new `origin/main` and isolate a task branch/worktree.
- [ ] Identify a measured, non-destructive optimization and add failing tests.
- [ ] Implement minimum backend and/or forward-only database fix.
- [ ] Run tests, security/parity/DB validation, Test readiness and main drift check.
- [ ] Prepare both English and Korean documentation, internal/GitHub updates, and PR.

## Finished

Pending fresh test results. **No development schema migration or Production release has been executed.**
