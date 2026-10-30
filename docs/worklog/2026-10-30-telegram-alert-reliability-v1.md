# Telegram Alert Reliability Audit — v2026.10.30.1

## Before work — 2026-10-30 09:00 KST
- Owner requested full recheck and repair of server, market/news, price and error Telegram alerts.
- Read AGENTS.md, integrated planning master, release documentation policy, v1510/v1511 worklogs; applicable systematic-debugging/TDD/worktree/verification/writing-plan skills. Base origin/main; isolated worktree avoids concurrent Gemini tasks.
- P0: market timer active/enabled but SubState elapsed and next elapse infinity; last market scan 2026-10-29 22:28:53 KST, no new execution by 2026-10-30 09:00. Original operations timer continues every two minutes and private chat remains paired.
- Root cause: legacy market timer only has OnBootSec and OnUnitInactiveSec; its initial one-shot exhausted its schedule after manual execution. No wall-clock recurrence; missed 09:00 KST market digest, prices and news.
- Secondary: base operation observer does not verify market timer next-run schedule; stale price comparisons after 10-hour gap could misleadingly claim near-real-time change.
- Scope: adjust independent timer and observers, run TDD + isolated real Test, evidence-driven Production promotion. No SQL/account/ledger changes, no backend/frontend restarts, no secrets in git.

## Checklist
- [ ] RED regression tests for timer cadence/health and stale market comparisons.
- [ ] GREEN source, Python checks and isolated Test.
- [ ] Reconcile live main and push separate PR with required CI.
- [ ] Backup and promote independent timer source; verify at least two scheduled market runs.
- [ ] Telegram send receipt and backend/frontend continuity, rollback check.
- [ ] English/Korean docs/changelogs, update integrated master and GitHub release.

## During work — RED/GREEN and Test evidence
- Reproduced active/elapsed/infinity market timer and correctly scheduled base timer.
- Five RED regressions for timer schedule, timer watchdog, stale market prices and delayed digest. A sixth RED regression showed a valid calendar timer has a realtime next trigger but infinity monotonic and must not be flagged.
- GREEN: 24/24 Python unit tests passed; py_compile passed; valid every-two-minute calendar future times confirmed.
- Isolated Test: read-only PostgreSQL snapshot from mv-v1212-prodrehearsal showed 9 stocks, 100 recent batches and 100 market events. Independent sandboxed systemd-run Test passed, exit 0; Test /health HTTP 200. No database mutations or Telegram mock events written.
- Original base Telegram timer is paired and executes normally. No secrets surfaced.
