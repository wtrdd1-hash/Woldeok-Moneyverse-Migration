# Capacity candidates — v2026.11.26.1250.1

Status: **CODE_READY / candidates verified in an isolated synthetic sandbox. Nothing here is applied to Production or the official Test runtime.** Production apply needs separate owner approval and the zero-downtime release gate (TESTGATE.1 G8/G9).

## Sandbox (isolated, synthetic, disposable)
- PostgreSQL 17.11 container, loopback only, 512 MiB / 2 CPU limit, fresh schema from `ci-apply.mjs` (migrations 001–353 + 354), synthetic market history at Production scale (1.15M ticks over 60 h, 430k minute candles, 10 seeded stocks). No Production data, no Production credentials.
- Spring jar built from this branch, loopback ports, all outbound integration settings empty. Verified only connection: its own database (the remaining twitch.tv connection was removed by the MusicManager change below).

## Changes in this branch
| Change | Evidence |
|---|---|
| `354-stock-retention-prune-indexes.sql`: indexes on `virtual_stock_price_ticks(recorded_at)` and `virtual_stock_minute_candles(bucket_at)` | Steady-state prune: Seq Scan 918,583 rows / 106 ms / ~18k buffers → Index Scan 1,130 rows / 0.54 ms / ~1.2k buffers; candles 43 ms → 0.07 ms (`evidence/prune-explain.txt`) |
| `MusicManager`: Lavaplayer remote sources only when a Discord bot token is configured | Sandbox outbound twitch.tv connection gone; unit tests |
| `loadgen.py`: staged loopback-only read-load generator (stdlib) | refuses non-loopback targets |

## JVM / memory candidate (`systemd/moneyverse-spring-backend.service.d/`)
Measured Production today: G1, max heap 2.0 GiB (default), committed 460 MiB, used 144 MiB, metaspace 131 MiB, 112 threads, RSS 330 MiB + swap 557 MiB, no cgroup limit.

| Sandbox run (100 VUs read mix, 60 s/stage) | A: auto (Serial) Xmx768m, cgroup 1.25/1.5 GiB | B: G1 Xmx512m, cgroup 1.0/1.25 GiB |
|---|---|---|
| RPS at 5/20/50/100 VUs | 3393 / 2990 / 2934 / 2807 | 3321 / 3023 / 2980 / 2858 |
| p95 / p99 at 100 VUs | 82.9 / 98.4 ms | 81.9 / 97.2 ms |
| 5xx / errors | 0 | 0 |
| Full GCs, max pause | 4, 97.5 ms | 0, 12.7 ms |
| Live heap after GC (max) | 87 MiB | 92 MiB |
| JVM RSS peak | ~507 MiB | ~574 MiB |
| DB pool | 10/10 used, 0 lock waits | 10/10 used, 0 lock waits |

Decision: **B**. Do not raise the pool (10) or heap: pool saturation produced no errors and latency is flat across GC settings, so the limit is CPU/request handling, not memory or connections.

## Host budget (7.9 GiB RAM, measured 2026-11-26 RSS+swap, shared pages over-counted)
| Group | Now | With candidates |
|---|---|---|
| Production API (4550) | 0.87 GiB, uncapped | ≤ 1.25 GiB cap (typ. 0.6) |
| Routed legacy read-only Production JVMs (5) | ~2.4 GiB (mostly swap) | retire after route migration (owner) |
| Production/Test frontends, blog | ~1.0 GiB | unchanged (already capped 640 MiB each) |
| Production PostgreSQL | ~0.3–0.5 GiB | unchanged |
| Test API + Test DB | ~0.6 GiB | unchanged |
| Local inference | peak 5.3 GiB + 3.0 GiB swap | ≤ 3 GiB cap, 1 model loaded |
| Agent sessions, MCP, desktop tools, ClamAV, orca | ~5 GiB | owner tooling, not changed |

**RAM recommendation:** the host carries ~14.7 GiB of swap. Production+Test alone fit 8 GiB once capped (~4 GiB), but local inference plus agent tooling do not fit beside them. Recommend **16 GiB** if inference and agent tooling stay on this host; 8 GiB is adequate only if inference moves off-host or is capped as above and the legacy read-only JVMs are retired.

## Not done / limits (honest)
- 60 s per stage, not 5 min. Read mix only; the Python generator plateaus near 3k RPS, so server maximum is not established.
- No authenticated write/ledger load yet (needs synthetic member sessions in the sandbox); ledger invariants therefore not exercised under load.
- No socket fan-out load. No Production or official Test change.
- DB timeouts: Production lost migration 266's database settings (see `sql/restore-db-timeouts-candidate.sql`); restoring needs owner approval and Test job verification.

## Rollback
- Migration 354: forward-only; if ever needed, a later migration drops the two indexes (`DROP INDEX IF EXISTS ...`). Indexes do not change results.
- systemd drop-ins: remove the drop-in file, `systemctl daemon-reload`, restart through the release process.
- Sandbox: `systemctl --user stop mv-capacity-sandbox-spring; docker rm -f mv-capacity-sandbox-db-20261126`.
