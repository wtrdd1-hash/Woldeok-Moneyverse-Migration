# v2026.10.30.3 — False-critical alert while stock market worker is running

## Before work — 2026-10-30 09:20 KST
- Owner-directed Telegram alert recheck revealed an additional post-promotion false alarm: the 2-minute market timer can momentarily be active/running while dispatching its oneshot service, with next trigger temporarily blank. The base watchdog labeled this as CRITICAL unscheduled:running although the timer later returned waiting with a valid next calendar deadline.
- Evidence: at 09:20:40 KST the market timer was active/waiting with next 09:22:00, after a successful 09:20 MARKET_OK; the base checkpoint wrongly recorded market CRITICAL unscheduled:running.
- Root cause: watchdog v2026.10.30.1 demanded SubState waiting even during legitimate systemd dispatch. This false alarm was not covered by v1/v2 unit tests.
- Authority: existing AGENTS.md, integrated master and release documentation policy, latest origin/main, isolated worktree to avoid Gemini work; read-only Test, TDD, CI/PR and independent alert-only Production promotion.
- Fix plan: accept transient active/running timer as expected while the market one-shot is in progress, but independently monitor the actual market worker's failed Result and still flag elapsed/infinity with no trigger. No app, DB, stock or ledger mutations.

## During work — TDD
- RED two tests: legitimate running schedule was incorrectly CRITICAL, worker failure was absent from snapshot. GREEN: 27/27 full Python tests pass.
- Operational source review: independent market systemd oneshot is bounded by TimeoutStartSec=45 seconds; no raw exception/error bodies are forwarded to Telegram. Real source unit statuses return active/waiting and worker success when not dispatching.
- Production pending until isolated Test, CI PR, exact source staging and final heartbeat receipts.
