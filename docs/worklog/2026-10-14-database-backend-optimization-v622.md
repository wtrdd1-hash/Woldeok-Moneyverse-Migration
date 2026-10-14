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
- [x] Identify a measured, non-destructive optimization and add failing tests.
- [x] Implement bounded outbox cleanup, forward-only migration 270 and test it on isolated synthetic PostgreSQL.
- [ ] Run tests, security/parity/DB validation, Test readiness and main drift check.
- [ ] Prepare both English and Korean documentation, internal/GitHub updates, and PR.

## Mid-work checkpoint — 2026-10-14 KST

- Actual DEV expired-outbox read EXPLAIN: parallel sequential scan, 36.158ms and 25,883 top-level shared buffers; no delivered_at index. This SELECT did not modify the DEV database.
- RED: 3 expected regression failures confirmed. GREEN: scheduler tests 10/10, database parity 7/7, contract/backend/database typechecks and backend build pass.
- Whole backend suite: 1,165 passed, 391 skipped; database tests skipped due to absent scoped DB credentials, not accepted as DB passes.
- Isolated Test PostgreSQL 17.11 database moneyverse_opt_v622 with 260,000 generated rows: migration 270 applied, pg_index valid/ready, autovacuum settings verified, 2,000-row selection 25.606ms / 1,701 buffers before vs 0.400ms / 13 after. Real DELETE of 2,000 executed inside BEGIN/ROLLBACK; it did not persist.
- Mid-work origin/main drift: c56af867 -> 77e27063, unrelated v619 disk-cleanup documentation; re-merge latest main before final verification.
- No Test service pointer, production data, financial data or schema_migrations of shared environments changed. Synthetic benchmark is not Production acceptance.

## Finished

Pending exact-SHA Test acceptance and safe rollout. **No shared development schema migration or Production release has been executed.**
