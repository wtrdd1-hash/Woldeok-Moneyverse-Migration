# Moneyverse Database Reference Expansion Review — v2026.09.29.486

**English canonical** | [한국어](MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.29.486.ko.md)

> Date: 2026-09-29  
> Scope: database research/planning evidence only  
> Runtime mutation: none  
> Predecessor: v2026.09.25.443

## Executive result

- Crossref discovery retrieval: **145,898 raw records** from six non-overlapping publication-date ranges covering 1900-2026.
- Strict title qualification: a retained record must contain whole-word `database` or the phrase `data base` in its title.
- Final corpus: **145,579 unique records** after DOI-first / normalized-title-fallback deduplication.
- Final corpus SHA-256: `d61e825f8f699ccfca9e1bc5ee13dd070d123440c680a8aa9d90c5a4d6a80216`.
- Corpus path: `docs/findings/MONEYVERSE_DATABASE_REFERENCE_CORPUS_v2026.09.29.486.csv`.
- Every final row was reparsed and rechecked against the strict title predicate; duplicate-key count is zero.

This satisfies the requested 100,000+ reference breadth with a materially stronger relevance gate than v443. It is still a **discovery corpus**, not a claim that 145,579 papers were manually read, peer-reviewed for Moneyverse, or adopted as architecture authority. Domain-specific biological, medical, citation, scientific, and other databases legitimately remain in scope because their titles are database-specific, but they do not automatically define product requirements.

## Method and provenance

Crossref's REST API was queried with `query.title=database`, `rows=1000`, cursor pagination, and six disjoint publication-date buckets. Only DOI, title, publication date, type, and URL metadata needed for provenance were retained. Crossref documents a maximum of 1000 rows per page and cursor pagination for larger result sets.

The first broad v486 exploratory pass produced 108,216 deduplicated candidates but random sampling exposed false positives from generic terms such as “optimization”, “recovery”, and “view”. That file was therefore **not accepted** as the final v486 corpus. The strict title pass superseded it.

Deduplication key:
1. lowercase DOI when present;
2. otherwise NFKC-normalized, case-folded, punctuation-stripped title.

## Repository baseline revalidated

The current repository continues to use numbered SQL migrations as schema authority, a restricted application role, `SECURITY DEFINER` mutation boundaries, exact-integer money, deterministic locking, idempotency, an append-oriented ledger/outbox model, and schema fingerprint/parity checks. Current runtime evidence identifies PostgreSQL 17.11 on the Debian 13 authority.

The Android repository remains an API client: its own documentation states that mutations are API-only and the app never writes PostgreSQL directly. Database planning therefore remains authoritative in this repository.

## Directly checked PostgreSQL 17 findings adopted

### DB486-01 — Concurrent-index validity is a release gate — P0
`CREATE INDEX CONCURRENTLY` avoids write-blocking table locks but can fail and leave an `INVALID` index that is ignored by queries while still adding update overhead. Test/Production DB acceptance must therefore assert no unexpected invalid indexes after migration/index work, and operators must use `pg_stat_progress_create_index` for long-running builds rather than treating “CONCURRENTLY” as impact-free.

### DB486-02 — Nullable uniqueness semantics must be explicit — P0
PostgreSQL unique constraints treat nulls as distinct by default. Any nullable business key must explicitly choose whether multiple nulls are legal; when one logical null is allowed, use `NULLS NOT DISTINCT` or an equally explicit invariant and test it.

### DB486-03 — Extended statistics are evidence-driven — P1
For demonstrated cardinality-estimation errors involving correlated columns, evaluate `CREATE STATISTICS` and verify plan improvement with `EXPLAIN (ANALYZE, BUFFERS)`. Do not create multivariate statistics speculatively across arbitrary column combinations.

### DB486-04 — Replication/CDC slots require a WAL-retention budget — P0 when enabled
If logical decoding, CDC, or replication slots are introduced, each slot must have an owner/consumer, lag and retained-WAL monitoring, a capacity budget, and a bounded `max_slot_wal_keep_size` policy or documented exception. PostgreSQL explicitly warns that slots can retain enough WAL to fill `pg_wal`.

### DB486-05 — Backup verification never replaces restore proof — P0
If physical/base backups are introduced, run `pg_verifybackup` against the manifest, but continue full disposable restore drills and application/data checks. PostgreSQL explicitly states that `pg_verifybackup` cannot perform every check a running restored server will perform.

### DB486-06 — Low-impact constraint rollout is explicit — P0
For large-table foreign-key/check additions where appropriate, use `NOT VALID` followed by `VALIDATE CONSTRAINT`; for unique constraints where applicable, build the unique index concurrently and attach the constraint. Lock/scan behavior remains part of migration review.

### DB486-07 — RLS is conditional defense-in-depth, not a substitute for privilege boundaries — P1
If Row-Level Security is introduced on tenant/user-scoped read models, tests must account for table-owner and `BYPASSRLS` behavior and use `FORCE ROW LEVEL SECURITY` where owner enforcement is intended. Current restricted-role plus security-definer architecture remains the primary mutation boundary.

## Acceptance and non-claims

- The 145,579-row corpus is **Tier C discovery evidence**.
- PostgreSQL/Crossref official documentation directly checked in this cycle is **Tier A primary evidence**.
- No runtime schema, migration, Test database, Production database, service, or user data was changed.
- The global `PROJECT_PLAN.md` remains at v444 under the existing documented authority-drift rule; this cycle updates the integrated planning ledger and the already-adopted database detailed specification without pretending to reconcile unrelated v445+ product decisions.

## Primary sources

- Crossref REST API: https://www.crossref.org/documentation/retrieve-metadata/rest-api/
- Crossref pagination guidance: https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/
- PostgreSQL 17 CREATE INDEX: https://www.postgresql.org/docs/17/sql-createindex.html
- PostgreSQL 17 constraints: https://www.postgresql.org/docs/17/ddl-constraints.html
- PostgreSQL 17 planner statistics: https://www.postgresql.org/docs/17/planner-stats.html
- PostgreSQL 17 ALTER TABLE: https://www.postgresql.org/docs/17/sql-altertable.html
- PostgreSQL 17 replication settings: https://www.postgresql.org/docs/17/runtime-config-replication.html
- PostgreSQL 17 replication slots: https://www.postgresql.org/docs/17/view-pg-replication-slots.html
- PostgreSQL 17 pg_verifybackup: https://www.postgresql.org/docs/17/app-pgverifybackup.html
- PostgreSQL 17 Row Security: https://www.postgresql.org/docs/17/ddl-rowsecurity.html
