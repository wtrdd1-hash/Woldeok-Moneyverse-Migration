# v2026.10.19.913 — Arcade Demo Payout Truth and Deterministic Rules

## Start · 2026-10-19 KST
- User requested actual remediation after all-feature re-audit; fallback GitHub route authorized when miniPC MCP cannot connect. The miniPC MCP system-status call timed out and Remote Desktop Commander reported offline, so **no host/Test/Production actions** can be asserted.
- Read current GitHub Integrated Planning Master before code, plus AGENTS.md, root historical implementation plan and docs/RELEASING.md. Important live balances require PostgreSQL SECURITY DEFINER journal functions, separate exact-SHA Test, finance certification and zero-downtime rollback.
- Isolated branch `fix/arcade-demo-truth-v2026.10.19.913` cut from latest `main`. Do not alter coworkers' worktrees/main directly.
- Root cause in current main: Mines and Plinko React components calculate stakes/wins entirely in browser state via Math.random with **no server money transaction/receipt**; visible text claims WLD won/lost and a Plinko RNG verification absent evidence. Mines on last gem invokes `cashOut(newGems)` but reuses stale `currentMultiplier`.
- Scope: make nonmonetary simulation unambiguous, eliminate fictional WLD payout/success claims, fix deterministic Mines last-gem multiplier, validate finite/safe-int simulated stakes, add tests. No production finance writes and **no real gambling payout** implementation.
- Verification plan: regression tests for math/invalid amount/copy, GitHub PR policy+test/build CI, exact SHA Test only when authorized host available. Release remains BLOCKED pending Production financial drift, app DML permissions, and signed-in full-route QA.

## Interim
Pending code changes and verification.

## Final
Pending CI / host availability.
