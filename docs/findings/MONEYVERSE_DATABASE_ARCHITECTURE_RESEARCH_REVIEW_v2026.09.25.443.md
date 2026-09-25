# Moneyverse Database Architecture Research Review — v2026.09.25.443

> Date: 2026-09-25
> Status: planning/research evidence
> Canonical language: English
> Discovery corpus: `MONEYVERSE_DATABASE_REFERENCE_CORPUS_v2026.09.25.443.csv`

## 1. Scope and evidence truth

This cycle expands the database-architecture evidence base and translates only high-confidence findings into Moneyverse requirements. It does **not** claim that every bibliographic candidate was manually read, relevant, or adopted.

The discovery run queried ten database-adjacent lanes through Crossref and fetched **80,000 raw records** (8,000 per lane). Deduplication uses DOI first and normalized title as a fallback. The resulting CSV contains **66,858 unique discovery candidates**, exceeding the requested 50,000-reference breadth target.

Broad bibliographic matching is intentionally treated as **Tier C discovery evidence**. Terms such as “recovery”, “replication”, “isolation”, “schema”, or “integrity” also occur outside database systems, so corpus membership alone is never a production-design justification. Architectural requirements below are grounded in directly checked PostgreSQL primary documentation and current repository evidence.

### Deduplicated first-lane distribution

| Discovery lane | Unique candidates first retained in lane |
| --- | ---: |
| Schema design | 8,000 |
| Integrity constraints | 7,811 |
| Transaction/concurrency | 6,900 |
| Index/query optimization | 7,980 |
| Partition/sharding/replication | 6,787 |
| Distributed consistency | 2,074 |
| Backup/recovery/WAL | 7,898 |
| Schema evolution/migration | 7,916 |
| Ledger/idempotency/audit | 7,041 |
| Privacy/retention/temporal | 4,451 |
| **Total** | **66,858** |

The corpus is dominated by journal articles, followed by book chapters and proceedings papers. It is a search base for follow-up review, not a quality ranking.

## 2. Current Moneyverse database strengths

Repository evidence already establishes several strong boundaries that should be preserved:

- Numbered SQL migrations own the schema; ORM migration authority is intentionally prohibited.
- Applied migration history is immutable and checksum-verified, including reverse parity against Production history.
- The application role has deliberately limited table DML and uses reviewed `SECURITY DEFINER` functions for protected mutations.
- WLD/balance values remain exact integer-compatible types across PostgreSQL, Node and frontend boundaries.
- Core economy writes use atomic database transactions, business idempotency keys and row locking.
- Existing code contains deterministic lock ordering in critical money paths and `SKIP LOCKED` workers for selected queues.
- Audit-chain and outbox patterns already move important integrity work into the database transaction boundary.
- Backup/restore documentation requires isolated restore drills instead of destructive Production restore tests.

These are architectural assets. v443 strengthens their verification and scaling rules rather than replacing them with an ORM, generic microservice split or premature distributed database.

## 3. High-confidence findings adopted

### 3.1 Constraints are part of the domain model

PostgreSQL primary keys, unique constraints, foreign keys and CHECK constraints are the final line of defense against application bugs and concurrent callers. Business-critical invariants that can be expressed safely in PostgreSQL should not live only in TypeScript validation.

Moneyverse therefore treats nullability, domain ranges, closed state vocabularies, uniqueness, ownership and referential rules as schema contracts. Application validation remains necessary for UX, but it is not the sole authority.

### 3.2 Foreign-key support indexes require an explicit audit

PostgreSQL automatically indexes the referenced side of a primary/unique key, but it does **not** automatically create an index on every referencing foreign-key column. Parent delete/update checks can therefore scan large child tables.

v443 requires an automated FK-index coverage audit. A child FK is accepted when a suitable left-prefix index exists or when a documented measured exception proves an index is counterproductive.

### 3.3 Indexes are query contracts, not decorations

Indexes accelerate reads but add write, vacuum and storage cost. Multicolumn B-tree indexes are most effective when their leading columns match actual predicates/order patterns. Duplicate “constraint + same explicit unique index” structures are unnecessary.

Index decisions must therefore be tied to real query shapes and runtime evidence from `pg_stat_statements`, PostgreSQL statistics and representative `EXPLAIN (ANALYZE, BUFFERS)` on Test data. Partial indexes should cover sparse active/pending queues where appropriate. BRIN is a candidate only for very large physically correlated append-heavy tables.

### 3.4 Partitioning is conditional, not a default

PostgreSQL partitioning is useful when tables are genuinely large or when retention/bulk lifecycle operations dominate. It can improve pruning and make old-data removal cheap, but it increases schema/index/constraint operational complexity.

Moneyverse must not partition every table. Audit logs, outbox/event history, chat history, price ticks and telemetry are **candidates** only after measured row count/bytes, growth rate, retention behavior and query predicates justify it.

### 3.5 Online schema evolution needs an expand-contract protocol

A migration that is syntactically valid can still create an availability incident. v443 formalizes:

1. expand with backward-compatible nullable/new structures;
2. deploy dual-compatible application code when required;
3. backfill in bounded resumable batches;
4. add expensive constraints in low-lock form where supported (for example `NOT VALID` then `VALIDATE CONSTRAINT`);
5. create large indexes with `CONCURRENTLY` when supported and appropriate;
6. switch reads/writes after validation;
7. contract old schema only after the old runtime is retired.

Table-rewrite DDL, destructive drops and long lock-taking operations are not normal zero-downtime cutover steps. Every migration gets a lock/scan/rewrite classification and a rollback/forward-fix plan.

### 3.6 Serializable correctness requires whole-transaction retry

PostgreSQL documents that transactions at Repeatable Read/Serializable can fail with serialization SQLSTATE `40001`; deadlocks `40P01` can also be transient. Correct recovery is to retry the **complete transaction logic**, not only the last statement.

Moneyverse combines bounded whole-transaction retry with the existing business idempotency key. Retry must regenerate transaction-local reads/decisions while preserving the same business command identity. Deterministic lock ordering remains required to reduce deadlocks.

### 3.7 Ledger authority and cached balances must be reconcilable

The append-only balanced posting journal is the strongest economic audit source. Any mutable balance projection is a performance/read model and must remain reconcilable to authoritative postings.

v443 requires invariant checks and a controlled rebuild/reconciliation path: debits equal credits per transaction, prohibited negative balances remain impossible, every balance-changing business command maps to one durable idempotent transaction, and sampled/full reconciliation can demonstrate that balance projections agree with journal totals.

### 3.8 JSONB remains bounded flexibility

JSONB is appropriate for versioned policy payloads, event metadata or heterogeneous evidence, but core identifiers, money, ownership, lifecycle state, idempotency keys and timestamps remain typed columns with constraints. A JSON document must not become an escape hatch around referential integrity or exact numeric types.

### 3.9 Maintenance/statistics are part of correctness at scale

Autovacuum, ANALYZE and planner statistics are operational dependencies for an MVCC database. High-churn tables need explicit dead-tuple/XID-age/vacuum-lag monitoring and may need per-table autovacuum tuning. Bulk backfills/imports require post-operation statistics refresh when planner quality is affected.

Routine `VACUUM FULL` is not an acceptable maintenance strategy because of its stronger locking/rewrite behavior.

### 3.10 Current logical backup is not point-in-time recovery

The existing encrypted six-hour logical backup is valuable and must remain. It is not equivalent to WAL-based continuous archiving/PITR. For stronger RPO, evaluate PostgreSQL base-backup + WAL archival into an independently administered immutable/off-host failure domain, with restore drills measuring actual RPO/RTO.

No backup mode is considered effective until a disposable isolated restore proves it.

## 4. v443 architecture gaps / requirements

These are planning requirements. They are not claims that the current runtime is already defective.

- **DB443-01 / P0 — Schema fingerprint:** generate an exact-SHA schema manifest/fingerprint from a fresh migration rebuild and compare structure, routines, grants and migration history against Test/Production to detect manual drift.
- **DB443-02 / P0 — Constraint audit:** require a primary key (or explicit reviewed keyless exception) and classify nullability/unique/check/FK invariants for every canonical table.
- **DB443-03 / P0 — FK index audit:** detect unsupported child-side foreign keys and require a supporting index or measured/documented exception.
- **DB443-04 / P0 — Zero-downtime migration contract:** require expand/backfill/validate/switch/contract, lock/rewrite budget, old/new runtime compatibility and exact candidate evidence.
- **DB443-05 / P0 — Transaction retry contract:** bounded whole-transaction retry for retryable serialization/deadlock errors plus stable business idempotency.
- **DB443-06 / P0 — Ledger reconciliation:** automated journal/balance invariant verification and documented rebuild/reconciliation procedure.
- **DB443-07 / P0 — Role separation:** application role remains non-owner/no-DDL; migration ownership and runtime execution roles stay separate; every security-definer routine pins a safe search path and explicit EXECUTE grants.
- **DB443-08 / P1 — Query/index evidence:** baseline critical query plans/statistics and govern index addition/removal by measured workload.
- **DB443-09 / P1 — Conditional partitioning:** define size/growth/retention thresholds and a per-table decision record before partitioning.
- **DB443-10 / P1 — Typed core / versioned JSONB:** preserve relational columns for authoritative core state and add payload schema/version metadata for flexible documents.
- **DB443-11 / P1 — Lifecycle/delete semantics:** every FK intentionally selects RESTRICT/NO ACTION/CASCADE/SET NULL behavior according to ownership and audit requirements; financial/audit history cannot disappear through accidental cascade.
- **DB443-12 / P1 — Maintenance SLO:** monitor autovacuum, dead tuples, XID age, analyze freshness, long transactions, locks, temp files and index/heap growth.
- **DB443-13 / P1 — Hot-path/read-model separation:** heavy dashboards and aggregates use bounded read models/snapshots/materialized views or later a replica when measurements justify it; they do not silently overload the write-authoritative ledger path.
- **DB443-14 / P0/P1 — DR evolution:** preserve verified encrypted logical backups and add WAL/PITR/off-host immutability only through tested, observable restore procedures.

## 5. Non-adopted shortcuts

The evidence does not justify any of the following today:

- replacing SQL migration authority with an ORM;
- sharding/distributed SQL merely because the research corpus contains distributed-database literature;
- partitioning all tables;
- adding every possible index;
- migrating Production to PostgreSQL 18 only to obtain newer features;
- changing UUID strategy without workload evidence;
- moving ledger invariants out of PostgreSQL into client/service code;
- using JSONB as the primary representation of money, ownership or authorization state.

Current Production is documented as PostgreSQL 17.11. v443 requirements therefore target PostgreSQL 17-compatible mechanisms unless an upgrade is separately planned and validated.

## 6. Acceptance and QA

Before a runtime DB change can be promoted:

1. Rebuild an empty PostgreSQL 17 database from all authoritative migrations and run database-backed tests.
2. Compare generated schema fingerprint against expected exact-SHA contract.
3. Run PK/constraint/FK-index/security-definer/grant audits.
4. Exercise upgrade from a representative previous schema and verify old/new application compatibility.
5. Capture lock duration, rewrite/scan classification and migration runtime on Test-sized data.
6. Exercise serialization/deadlock retry on critical ledger, work, stock, shop/bank and administrative economy mutations.
7. Reconcile ledger/posting totals to balance projections.
8. Verify critical query plans and regression budgets.
9. Run backup/restore evidence; when PITR is implemented, restore to a specified timestamp and verify recovery lineage.
10. Promote only the exact Test candidate with the repository's existing zero-downtime release, health, session-continuity and rollback gates.

This v443 cycle itself is research/planning/documentation only and therefore does not claim a database migration, Test deployment or Production promotion.

## 7. Primary references directly checked

- PostgreSQL 17 — Constraints: https://www.postgresql.org/docs/17/ddl-constraints.html
- PostgreSQL 17 — Indexes: https://www.postgresql.org/docs/17/indexes.html
- PostgreSQL 17 — Multicolumn indexes: https://www.postgresql.org/docs/17/indexes-multicolumn.html
- PostgreSQL 17 — Table partitioning: https://www.postgresql.org/docs/17/ddl-partitioning.html
- PostgreSQL 17 — CREATE INDEX: https://www.postgresql.org/docs/17/sql-createindex.html
- PostgreSQL 17 — ALTER TABLE: https://www.postgresql.org/docs/17/sql-altertable.html
- PostgreSQL 17 — Serialization failure handling: https://www.postgresql.org/docs/17/mvcc-serialization-failure-handling.html
- PostgreSQL 17 — Explicit locking: https://www.postgresql.org/docs/17/explicit-locking.html
- PostgreSQL 17 — Routine vacuuming: https://www.postgresql.org/docs/17/routine-vacuuming.html
- PostgreSQL 17 — Monitoring statistics: https://www.postgresql.org/docs/17/monitoring-stats.html
- PostgreSQL 17 — pg_stat_statements: https://www.postgresql.org/docs/17/pgstatstatements.html
- PostgreSQL 17 — Backup and restore: https://www.postgresql.org/docs/17/backup.html
- PostgreSQL 17 — Continuous archiving / PITR: https://www.postgresql.org/docs/17/continuous-archiving.html
- PostgreSQL 17 — Logical replication: https://www.postgresql.org/docs/17/logical-replication.html
- OWASP Database Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html

The 66,858-record Crossref corpus is preserved separately for discovery provenance and future focused reviews.
