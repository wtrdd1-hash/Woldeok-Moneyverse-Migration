# Backend capacity implementation — v2026.11.26.1250.1
**English canonical** | [한국어](2026-11-26-backend-capacity-v1250.1.ko.md)

Status: CODE_READY (isolated synthetic sandbox verified). Not applied to Production or the official Test runtime. Native app work paused (APPHOLD.1).
Branch `perf/backend-capacity-20261126`, stacked on the game-year branch (carries migrations 350–353; new migration 354). Base main 1df1150e97.

## Before work
- Owner instruction v1250.1: real settings/code and isolated synthetic load verification, not a plan only. PR #3461 stays PLANNING.
- Security checkpoint preserved on its own branch; no other agent's folder modified.

## In progress
- Disposable sandbox: PostgreSQL 17.11 (loopback, 512 MiB cap) built from `ci-apply.mjs`; Spring jar from this branch on loopback ports with every outbound integration empty; synthetic Production-scale market history.
- Market-history prune: added migration 354 (indexes on the prune columns). Steady-state EXPLAIN (ANALYZE, BUFFERS): 106 ms / 918,583 rows scanned → 0.54 ms index scan.
- Found Lavaplayer remote-source registration contacting twitch.tv on startup in runtimes without a bot token; now registered only with a token.
- Found Production lost migration 266's database timeouts (no statement / idle-in-transaction timeout); restore script prepared as a candidate (owner approval).

## Finished
- Load (read mix, 5/20/50/100 VUs, 60 s each): 0 errors; p99 ≤ 98 ms at 100 VUs; pool 10/10 with no lock waits. G1 512 MiB candidate: 0 full GCs and 12.7 ms max pause vs 4 full GCs / 97.5 ms when the JVM auto-selects Serial under a cgroup limit. Live heap ~90 MiB.
- Candidates: systemd drop-ins for the Production API (G1, Xmx512m, MemoryHigh 1 GiB / Max 1.25 GiB) and local inference (1 loaded model, 3 GiB cap); DB timeout restore SQL; host budget and RAM recommendation (16 GiB if inference and agent tooling stay on host). Details: `ops/capacity-v20261126/README.md`.
- Verification: Spring 849 tests / 0 failures / 0 skipped on this branch; migration parity 6/6; sandbox apply of 001–354 clean.
- Not done: authenticated write/ledger load, socket fan-out load, 5-minute stages, server maximum throughput (generator-bound ~3k RPS). Official Test publication HOLD (no designated publisher/common lease). Production apply needs owner approval.
