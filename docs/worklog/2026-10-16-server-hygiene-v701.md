# v2026.10.16.701 — Server optimization and ACL worklog (EN)

## Before — 2026-10-16 KST
- User requested residual issue resolution and host optimization; GitHub main `8ba6b4426f9e662f7196f364bfc19c9350476cc1`, live Production v697 exact source. Consulted AGENTS, master/index, deployment, security and retention docs.
- Host CPU load 0.02, zram swap ~3.4GiB, memory PSI low, disk 81% full. Release policy protects active + >=10 Production/Test rollback roots; 23+ owned/other-agent worktrees and data must not be destroyed.

## During
- Created isolated `ops/server-optimization-v2026.10.16.701` at latest main.
- Scoped generated build cleanup to clean merged v695/v696 owned worktrees after checking Git commits, process CWD and path allowlist. Exact space reclaimed 2,623,094,784 bytes (~2.44GiB), disk 81%→78%; frontend/backend Production and Test health 200, SHA unchanged.
- Found 11 publicly executable SECURITY DEFINER functions; all eleven explicitly granted to moneyverse_app. Crafted fail-closed transaction-only PUBLIC revoke, verifier, 11-function rollback in ops/security.
- Root-only current Production DB logical snapshot + TOC verification; restored in Test PostgreSQL as shadow. Red→green public privilege probe 11→0 and app explicit 11; recovery test returned 11 and reapplied to 0. Hardened-shadow v697 API health/stocks/version 200, protected route 401. No Production DB data mutations during QA.

## End
- Host disk optimized, no protected release or other-agent data deleted. Production privileges follow recorded operator state; known direct balance/ledger DML and owner of legacy background jobs remain tracked risks.
