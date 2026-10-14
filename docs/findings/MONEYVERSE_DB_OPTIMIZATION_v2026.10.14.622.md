# Database and backend performance review — v2026.10.14.622

**English canonical** | [한국어](MONEYVERSE_DB_OPTIMIZATION_v2026.10.14.622.ko.md)

## Authority and scope

- Canonical contracts: [Integrated Planning Master](../planning/INTEGRATED_PLANNING_MASTER.md), [Database Architecture](../planning/DATABASE_ARCHITECTURE_SPEC.md), [Database Migrations](../operations/database-migrations.md), and [Release Guide](../RELEASING.md).
- Status: isolated implementation candidate, **not yet promoted to Test/Production**. Starting main c56af867; mid-work main 77e27063, which changed v619 documentation only.
- Protected ledger, balances, audit and user sessions are intentionally outside this change.
- Existing discovery corpus (145,579 qualified records): [v486 reference review](MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.29.486.md). Bibliographic scale is not performance proof.

## Measured development database baseline

PostgreSQL 17.11; DEV database 957 MB (2026-10-14 KST), not Production. Approximate pg_stat_user_tables observations:

| Table | Total bytes | Live estimate | Dead estimate | Implication |
| --- | ---: | ---: | ---: | --- |
| user_activity_logs | 424 MB | 659,086 | 166 | Large analytical retention; avoid index removal before workload evidence |
| outbox_events | 213 MB | 266,707 | 46,941 | High-churn events, heavy vacuum demand |
| virtual_stock_price_ticks | 105 MB | 279,856 | 0 | 88,554 actual rows older than 24h; separate cleanup review |
| content_status_snapshots | 88 MB | 326,407 | 0 | Retention and partition feasibility backlog |
| virtual_stock_minute_candles | 71 MB | 310,066 | 13,220 | Index and retention review backlog |

For outbox events, 9,612 delivered records were older than 7 days, while 2,313 events remained undelivered. Those pending events **must not be deleted**.

Actual DEV read-only EXPLAIN ANALYZE BUFFERS for selecting 2,000 expired outbox IDs sorted by delivered_at, id: parallel sequential scan, execution **36.158 ms**, approximately **25,883 shared buffers** at the top node (7,918 hits + 17,965 reads). No supporting delivered_at index existed. This is a snapshot, not a stable production SLA.

## Targeted implementation

1. Forward-only migration **270-outbox-retention-and-vacuum.sql**: create a partial BTREE index on delivered_at, id where delivered_at is not null, using CREATE INDEX CONCURRENTLY outside a transaction. Apply short lock timeout; avoid prolonged blocking of event writers.
2. Tune only outbox_events vacuum/analyze table storage thresholds to 1,000 + 5% of live rows (global settings unchanged). This targets observed dead tuple accumulation; retain PostgreSQL auto-vacuum.
3. Backend scheduler system.outbox_sweep uses a parameterized 2,000-row oldest-delivered selection and individual short DELETE transactions, at most 25 batches / 50,000 deletions per daily run. Never delete undelivered events or alter the original seven-day retention period.
4. Progress outcome records deleted, batches, limitReached; malformed batch counts fail the scheduled window. Partial prior batches are intentionally committed and the operation is idempotent on the next window.
5. Existing stock.ticks_cleanup is unchanged to avoid unbenchmarked global-index or retention changes. Other large tables are evidence-backed follow-ups, not stealth schema changes.

## Verification and limitations

- TDD: 3 newly added backend regression tests failed before implementation, all 10 scheduler tests passed afterward.
- Typecheck: backend, database and contract build completed; Nest backend build passed.
- DB migration parity: 7/7 passed; full backend unit/E2E (without live DB credentials): 1,165 passed and **391 skipped**. Skipped DB tests must not be presented as passed.
- Dedicated synthetic PostgreSQL 17.11 test database moneyverse_opt_v622, 260,000 generated outbox rows: migration executed; index marked valid and ready, table reloptions set; selected 2,000 IDs baseline 25.606 ms / 1,701 buffers; after index 0.400 ms / 13 buffers, index-only scan. Synthetic measurements are not proof of Production gain; warm cache, payload width and data distribution differ.
- DELETE selection returned 2,000 under explicit BEGIN/ROLLBACK. No source-of-truth money, member state, or Production database was modified by the experiment.
- **Not yet accepted:** fresh complete production-parity migration replay and live backend DB integration tests against a representative isolated Test stack; exact-SHA Test/API readiness, auth/security negative tests, backup and restore evidence, Production cutover and post-release observability.

## Required migration safety and release order

Before applying 270 to Test or Production: verify concurrent branch migration numbering, immutable checksums and privileges; take a verified database backup and restore test. Check that no invalid index of the same name exists; a failed concurrent index build can leave an invalid index, which IF NOT EXISTS alone does not repair. Run migrations with psql autocommit (concurrent index creation cannot run inside a transaction block). Confirm pg_index.indisvalid/indisready, pg_class.reloptions, EXPLAIN on representative data, migrations, worker output and security boundaries. Deploy database index before switching the new scheduler code. Use the release guide's exact-SHA Test, backend health, signed-in session continuity and zero-downtime Production promotion gates. No forced production changes are authorized by synthetic evidence.

## References

- PostgreSQL 17 CREATE INDEX / CONCURRENTLY: https://www.postgresql.org/docs/17/sql-createindex.html
- PostgreSQL 17 EXPLAIN, ANALYZE, BUFFERS: https://www.postgresql.org/docs/17/using-explain.html
- PostgreSQL 17 Routine Vacuuming: https://www.postgresql.org/docs/17/routine-vacuuming.html
- PostgreSQL 17 Automatic Vacuuming: https://www.postgresql.org/docs/17/runtime-config-autovacuum.html
- SQLAlchemy ORM is not authoritative in this application; PostgreSQL SECURITY DEFINER command paths remain the boundary.

## Follow-up priorities

P1: qualify safe retention/archive for activity and content snapshots with privacy/retention owners. P1: examine virtual_stock_price_ticks delete plan, workload and time-based partition thresholds. P2: collect top normalized queries through approved pg_stat_statements configuration and per-endpoint p95/p99 baselines; verify index scans over a representative window before removing any index.
