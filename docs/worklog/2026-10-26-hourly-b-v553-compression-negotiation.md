# Backend B v553 — HTTP content negotiation and cache variation integrity

## Before work — 2026-10-26 11:35 KST
- Base: origin/main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fresh fetch).
- Read AGENTS.md, README.md, English/Korean PROJECT_PLAN, QA Draft #1317, open A/C/planning/B PRs and CI. All active Draft changes remain untouched.
- MiniPC Debian 13.6 healthy; root ~6.5GiB free, data ~35GiB free. No live database writes.
- Scope: one P1 HTTP response correctness defect: response compression currently ignores `q=0` in Accept-Encoding and overwrites pre-existing `Vary`, which can cause clients to receive forbidden encodings and shared caches to omit the Origin variation.
- Isolation: fresh branch/worktree; no changes to other worktrees, applied migrations, economy ledger, API routes or credentials.
- Plan: RED test forbidden gzip/deflate and Vary preservation; implement minimal parser and header merge; GREEN focused suite; verify typecheck/build/lint/test/CI; keep merge/Production HOLD on failed gates.

## In progress
- [x] Reproduce failing regression tests: 5/5 RED (11:35 KST).
- [x] Implement q-weighted negotiation, explicit refusal and Vary merge; focused 13/13 GREEN (11:36 KST).
- [ ] Re-fetch main and planning; run project gates and record SHA.

## Finished
- Pending full verification and CI.
