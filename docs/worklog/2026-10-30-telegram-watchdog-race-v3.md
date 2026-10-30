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

## Finished — Production release
- Rebased PR candidate 5ed822b8c02dc17c67aaff507b0d2364bda82fb3 onto contemporary master planning 74ca81cde; PR #1969 merged source at 7c4919d95590f052d2e2d7295d64ad75b53501ff.
- CI policy and non-runtime-summary PASS; runtime JS build checks SKIPPED by classifier. Python 27/27 full suite PASS, syntax PASS. Isolated systemd-run Test worker (ProtectSystem=strict) 0/SUCCESS and Test HTTP 200.
- Saved backup of previous root-owned bridge under /srv/moneyverse-data/backups/telegram-watchdog-race-v2026.10.30.3, exact merged SHA source installed without web/application restart.
- Independent market.timer waiting with valid scheduled NextElapseUSecRealtime at 09:26:00 KST, and market.service success recorded as a separate monitored signal. Base alerts timer active/waiting, base service CHECK_OK exit 0.
- Backend/frontend PIDs unchanged 1018225/2041338; Test/Production HTTP 200. Paired bot private delivery API path was successfully exercised by the prior explicit EVENT_SENT audit smoke test; no new 3rd-party bot read receipt is claimed.
- V1–V3 complete. Remaining: separate gateway log redaction security work; domain-specific finance/deployment producers are not wired to Telegram automatically. Read-only finance sanity count does not equal complete audit certification. Disk space recovery was concurrent and not attributed to this task.
