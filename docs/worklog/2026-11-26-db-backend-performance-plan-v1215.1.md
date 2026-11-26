# DB/backend performance analysis and isolated load-test plan — v2026.11.26.1215.1
**English canonical** | [한국어](2026-11-26-db-backend-performance-plan-v1215.1.ko.md)

Status: PLANNING (read-only diagnostics; no code, migration, configuration or runtime change). Base main 1df1150e97.

## Method
Read-only statistics and catalog views on the live database (no member rows read), unit/JVM settings and repository source. Statistics have never been reset, so counts are cumulative since the last server start.

## Findings (ranked)
| # | Finding | Evidence | Proposed fix (later, gated) |
|---|---|---|---|
| P1 | Market tick pruning seq-scans the whole tick table inside the tick transaction | 053/124 market tick function runs `DELETE … WHERE recorded_at < now()-2 days` with probability 0.001 per tick; ~6.6 ticks/s gives a full scan of ~1.1M rows roughly every 2.5 min. `virtual_stock_price_ticks`: 1,761 seq scans, 1.39B tuples read, 8 index scans; no index leads on `recorded_at`. Same for `virtual_stock_minute_candles` (prune by `bucket_at`; PK leads on `stock_id`). | New migration: index on `recorded_at` / `bucket_at` (CONCURRENTLY is not possible inside migrate.sh transactions — verify), or move pruning out of the tick into a bounded scheduled batch. Prove with EXPLAIN on Test DB before/after. |
| P2 | Two retention paths disagree | Legacy NestJS scheduler prunes ticks after 24 h; migration 124 after 2 days. Table spans ~2 days, so the 24 h job is not effective (gateway retired or not scheduled). | Decide one owner of retention (Spring/DB function) and record. |
| P3 | No query-level observability | `pg_stat_statements` not installed, `log_min_duration_statement=-1`, `track_io_timing=off`. Slow-SQL ranking is therefore impossible. | Enable on the isolated Test DB first; Production needs a restart → separate owner approval. |
| P4 | No server-side timeouts | `statement_timeout=0`, `idle_in_transaction_session_timeout=0`; 3 deadlocks recorded. | Role-level timeouts for `moneyverse_app` (Test first). |
| P5 | Memory isolation | Production Spring JVM has no `-Xmx` and no systemd `MemoryMax` (JVM default ≈ 25% of 7.9 GiB). Local inference service allows up to 7 GiB on the same host. | Explicit heap + MemoryHigh/Max per service; lower inference ceiling. Requires restart → owner approval. |
| P6 | DB memory defaults | `shared_buffers`=128 MB, `work_mem`=4 MB, 405 MB temp spill cumulative; cache hit 98.7 %. | Tune only after P3 data. |
| P7 | Growth without retention | `user_activity_logs` 782 MB / 1.27M rows, `content_status_snapshots` 614 MB / 2.4M rows; several large never-used indexes (e.g. snapshot PK 103 MB, activity `path` 10 MB). | Retention policy as a record, not ad-hoc DELETE; index review on Test. |
| P8 | Connection budget | max_connections 100; app pool 10 per JVM; after cleanup 14 idle app connections + remaining read-only JVMs. 20 s acquisition timeout. | Budget table per runtime; keep sum < 60. |

## Isolated Test load-test plan (not executed)
Preconditions (all required; otherwise HOLD): designated QA publisher and common exclusive lease (TESTGATE.1 G8); isolated Test DB with synthetic data only (no Production copy); Test backend/frontend identity receipts; no outbound integrations (Discord/Telegram/SMTP) enabled; Production untouched.
1. Baseline: enable `pg_stat_statements` + `log_min_duration_statement=200ms` on the Test DB; reset stats.
2. Read mix: public pages, `/api/v1/stocks`, candles, wallet summary (synthetic members). Stages 5 → 20 → 50 → 100 VUs, 5 min each; record RPS, p50/p95/p99, error rate.
3. Write mix: idempotent purchases/transfers with unique keys, plus duplicate-key replays and concurrent same-key requests; assert ledger balance invariant (debits = credits, no negative non-allow accounts) after each stage.
4. Market tick under load: measure tick latency with/without P1 fix.
5. Realtime: socket fan-out with 50/200 synthetic subscribers.
6. Collect: DB connections/waits/locks, top statements, JVM heap/GC pauses, RSS/swap per service.
Exit criteria: p95 < 500 ms reads, p99 < 1.5 s, 0 ledger invariant violations, 0 5xx at ≤ 50 VUs, no pool exhaustion.

## Not done / blockers
No load test executed (no designated publisher/lease; isolated synthetic Test DB not verified). No Production setting changed.
