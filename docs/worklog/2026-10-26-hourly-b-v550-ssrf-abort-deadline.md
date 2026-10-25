# Backend B v550 — Outbound SSRF fetch abort/deadline integrity

## Before work — 2026-10-26 08:35 KST
- Starting `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent branch `auto/hourly-b-ssrf-abort-deadline-v550-20261026-0835`.
- Read AGENTS.md, README.md, English/Korean living plans, open PRs including #1368, QA #1317/#1391, CI, and A/C/Planning overlap. Scope intentionally excludes IPv4-mapped SSRF #1368 and DNS rebinding #1369.
- Debian 13.6 miniPC services active; root filesystem 100% (735MiB free), data volume 77% (45GiB free). No changes to other worktrees.
- P1 hypothesis: `safeFetch` lets a caller-supplied `RequestInit.signal` override the wrapper's ten-second AbortController; an unresponsive upstream can therefore hold backend requests indefinitely.
- RED: demonstrate caller-signal timeout bypass; GREEN: compose timeout and caller abort without losing either; verify redirects use the same deadline.
- No DB migration, economic write, API shape change or deployment is authorized.

## In progress
- Pending tests and implementation.

## Finished
- Pending gates and release hold.
- RED evidence at 08:36 KST: new 3-test suite reports 2 timeout failures (caller-signal bypass and redirected request), 1 caller-abort PASS. The failures reproduce the real 10-second deadline bypass before implementation.
- GREEN at 08:37 KST: 16/16 SSRF focused tests PASS after combining `AbortController.signal` with caller cancellation via `AbortSignal.any`; same-origin redirect keeps one deadline. Fixed test harness to attach rejection assertions before advancing fake time, eliminating unhandled rejections.
- Mid-run `origin/main` remains `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; English/Korean plans rechecked. No conflict with other open PRs.
