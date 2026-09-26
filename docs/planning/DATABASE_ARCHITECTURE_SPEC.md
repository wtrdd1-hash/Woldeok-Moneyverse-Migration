# Database Architecture Specification — v2026.09.25.443

> Status: adopted detailed planning specification
> Canonical language: English
> Runtime baseline: PostgreSQL 17.x unless a separately approved upgrade changes it
> Research evidence: [MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.25.443.md](../findings/MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.25.443.md)

## 1. Authority

1. Numbered SQL migrations remain the schema authority.
2. Applied migration files are immutable and checksum-bound.
3. The application runtime role is not a schema owner and receives no DDL authority.
4. Protected money, entitlement, moderation and privileged state changes use reviewed database functions/transactions rather than ad-hoc direct table mutations.
5. Generated schema manifests and catalog observations are verification evidence, not a replacement for migration history.

## 2. Canonical vs derived data

Every persistent field/table must be classifiable as one of:

- **canonical entity/state** — authoritative identity, ownership, policy state or lifecycle state;
- **append-only event/journal** — durable economic, audit or integration history;
- **projection/read model** — reproducible or reconcilable acceleration structure;
- **ephemeral/operational** — queue, lease, rate-limit or transient coordination state;
- **archive/retained evidence** — preserved under lifecycle/audit requirements.

A derived projection must name its source of truth and its rebuild/reconciliation mechanism. Denormalization without ownership and repair semantics is prohibited.

## 3. Keys, types and time

- Canonical tables use a primary key unless a reviewed keyless staging/bridge exception is recorded.
- Foreign keys represent real ownership/reference relationships instead of duplicating identifier strings without integrity.
- WLD and exact virtual-money quantities use integer-compatible PostgreSQL types and integer strings over JSON/API boundaries. Floating-point money is prohibited.
- Ratios/rates use bounded integer units such as basis points/ppm when feasible, otherwise constrained PostgreSQL `numeric`; binary floating point is not authoritative.
- Persist real-world timestamps as `timestamptz`. The game clock is a distinct logical-time domain and must not overwrite real audit/event time.
- State vocabularies require CHECK/enum/reference-table constraints appropriate to their expected evolution.

## 4. Referential integrity and deletion

Each FK must document:

- ownership: owned component vs independent record;
- parent update/delete behavior;
- retention/audit effect;
- expected lookup/delete workload;
- supporting child-side index or measured exception.

Default posture:
- financial/audit/history records: `RESTRICT`/`NO ACTION` or anonymized retained ownership as defined by lifecycle policy;
- truly owned disposable children: reviewed `ON DELETE CASCADE`;
- optional associations: reviewed `SET NULL` only when null retains valid semantics.

Accidental cascade deletion of ledger, audit or compliance evidence is a P0 defect.

## 5. Constraint and schema-fingerprint gate

CI/Test must generate a normalized schema manifest containing at least:

- relation and partition identity;
- column name/order/type/nullability/default/generated identity;
- PK/UNIQUE/FK/CHECK/exclusion constraints and validation state;
- index definition/predicate/access method/validity;
- triggers;
- functions/procedures, volatility/security-definer/search-path metadata;
- table/function ownership;
- grants/default privileges;
- migration filenames/checksums.

A fresh migration rebuild is compared against the exact-SHA expected manifest. Test/Production catalog snapshots are compared for unexplained drift. A manual hotfix is not normalized into truth by silently editing history; it requires a new migration/reconciliation record.

## 6. Transaction, idempotency and locking

### 6.1 Business-command identity
Every externally retryable money/entitlement/stock/shop/bank/treasury/work mutation has a durable business idempotency key. A replay may return the original result only after proving actor + semantic request identity matches.

### 6.2 Atomicity
All rows required to preserve an invariant change in one database transaction. Outbox/event emission needed to represent the committed business action is written atomically with the state change.

### 6.3 Locking
Acquire multiple entity/account locks in a deterministic key order. Never rely on request arrival order. Worker queues may use `FOR UPDATE SKIP LOCKED` only where skipped work remains durable and retryable.

### 6.4 Retry
Retryable SQLSTATE such as `40001` and, when classified safe, `40P01` retries the complete transaction function with bounded attempts, jitter/backoff and telemetry. Idempotency identity remains stable across attempts.

No retry loop may turn a permanent constraint/authorization/insufficient-balance error into an infinite transient retry.

## 7. Ledger structure

The append-only ledger/journal is authoritative for economic mutation history.

Required invariants:
- every ledger transaction has >=2 postings when double-entry semantics apply;
- total debit equals total credit for each transaction;
- posting amount is positive and direction is explicit;
- account identity and currency/domain are constrained;
- prohibited negative balances cannot commit;
- one business idempotency key cannot create two economic effects;
- correction/reversal is a new auditable transaction, not an edit/delete of historical postings.

`account_balances` or equivalent mutable balances are projections/cache state. Provide:
- transactional update with the journal;
- sampled reconciliation;
- full reconciliation procedure;
- safe rebuild/repair path with audit evidence;
- alert on any divergence.

## 8. Query and index architecture

Indexes are attached to measured query contracts.

For each critical endpoint/worker:
- record predicate, join and ordering columns;
- record expected cardinality/selectivity;
- retain representative `EXPLAIN (ANALYZE, BUFFERS)` evidence on Test-sized data;
- set a regression budget for latency/rows scanned where useful.

Rules:
- PK/UNIQUE-created indexes are not duplicated.
- FK child columns get suitable left-prefix indexes unless a measured exception exists.
- multicolumn indexes put equality/leading predicates before less selective trailing columns according to actual query shape.
- partial indexes are preferred for small active/pending/unprocessed subsets when the predicate is stable.
- expression indexes require deterministic expressions and demonstrated query use.
- BRIN is reserved for very large physically correlated data.
- removal of an index requires usage/workload evidence and a rollback plan; “zero scans” over an unrepresentative short window is insufficient.

## 9. Partitioning threshold

Partitioning requires a decision record with:
- current bytes/rows and monthly growth;
- hot vs retained time horizon;
- query predicates/pruning evidence;
- retention/drop/archive operations;
- uniqueness/FK limitations;
- index creation/maintenance plan;
- backup/restore impact;
- migration and rollback cost.

Likely future candidates are append-heavy histories (audit/outbox, chat, market ticks, telemetry), but no candidate is approved solely by category.

Do not use partitioning to compensate for a missing ordinary index or an unbounded API query.

## 10. JSONB boundary

JSONB is allowed for flexible/versioned structures such as:
- policy payload/evidence;
- event metadata;
- provider-specific metadata;
- archived snapshot bodies.

The row still carries typed authoritative identity, actor/owner, timestamps, state, idempotency and important query keys outside JSONB. Every mutable JSONB business payload has an explicit semantic version or equivalent decoder contract. Frequently filtered JSON properties should be promoted to typed/generated columns or deliberately indexed when measurements justify it.

## 11. Online migration protocol

Every migration is classified:
- **A — metadata/additive low-risk**
- **B — additive + backfill**
- **C — index/constraint validation**
- **D — rewrite/high-lock**
- **E — destructive/contract**

Required sequence for B–E:
1. exact previous schema baseline and data-size estimate;
2. backward-compatible expand;
3. optional dual-read/write compatibility;
4. bounded, resumable, observable backfill;
5. index/constraint build using lower-blocking PostgreSQL mechanisms where supported;
6. validation and schema-fingerprint refresh;
7. application switch;
8. old-runtime retirement proof;
9. destructive contract in a later release.

Every migration has `lock_timeout`/statement-time expectations or an equivalent operational guard, plus failure/forward-fix/rollback semantics. D/E changes require isolated Test execution on representative data and must not be first exercised in Production.

## 12. Security boundary

- Runtime application role: no DDL; no blanket owner/superuser; direct DML only where explicitly justified.
- Migration owner/role is separate and unavailable to ordinary request handling.
- `SECURITY DEFINER` functions use a safe pinned `search_path`, validate actor/role/policy internally, revoke unwanted PUBLIC execution and explicitly grant intended roles.
- Secrets never live in schema defaults, migration history or SQL logs.
- Privileged/admin mutations preserve recent reauthentication/authorization/CSRF/audit/idempotency contracts at the application boundary and re-check database-relevant role/invariant requirements inside the mutation boundary.

## 13. Maintenance and observability

Record and alert, per important table/database, on:
- relation/index size and growth;
- live/dead tuples;
- autovacuum/analyze age and failures;
- oldest transaction/XID pressure;
- long-running transactions and blocked/blocking sessions;
- lock wait/deadlock/serialization retry rate;
- temp bytes/spill;
- cache/read patterns as appropriate;
- unused/duplicate/invalid index candidates;
- top normalized queries via approved `pg_stat_statements` configuration;
- migration duration and lock impact.

High-churn tables may receive explicit autovacuum settings backed by measurements. Bulk backfill/import plans include post-operation ANALYZE when statistics may be stale.

## 14. Backup, recovery and replication

Current verified encrypted logical backup remains required.

For stronger RPO/RTO, a future PITR lane may add:
- base backups;
- WAL archiving;
- off-host immutable/versioned storage;
- isolated restore target;
- measured recovery to an explicit timestamp;
- integrity/application read checks;
- credential/failure-domain separation.

A read replica or logical replication target may later serve reporting/analytics only after consistency/staleness semantics and failover ownership are defined. Replica presence must not create a second write authority accidentally.

## 15. Automated DB QA suite

Add or maintain machine checks for:
- migration contiguous numbering/checksum/reverse parity;
- fresh PostgreSQL 17 rebuild;
- schema fingerprint equality;
- every `SECURITY DEFINER` search path and grants;
- canonical table PK exceptions;
- FK index coverage;
- invalid/duplicate index candidates;
- ledger debit/credit and balance reconciliation;
- retry/idempotency concurrency;
- orphan/reference integrity;
- migration old/new-app compatibility;
- query-plan baselines for critical paths;
- backup restore and, if adopted, PITR drill.

Database-backed checks that are skipped because a database is unavailable are reported as **not verified**, never PASS.

## 16. Release gate

Runtime schema changes use a dedicated development branch and the standard exact-SHA isolated Test path. Production promotion remains zero-downtime and requires migration completion, schema fingerprint match, backend health, critical DB mutation/read checks, session continuity, logs/metrics and a compatible rollback/forward-fix target.

This specification does not itself change the runtime schema.
