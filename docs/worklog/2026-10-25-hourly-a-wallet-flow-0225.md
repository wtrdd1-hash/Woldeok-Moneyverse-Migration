# Development A — owner-only wallet cash-flow snapshot (2026-10-25 02:25 KST)

## Before work
- Debian 13.6 miniPC status: backend/frontend/MCP/Nginx/Docker active; development DB connection confirmed. **The database name does not prove isolation**; no write on production-connected port 5433.
- Baseline `origin/main`: `c9a868b1e622341e2daa8b936ddf0988eda9988e` (checked after fetch). Latest mutable integrated planning PR #1205 SHA `e744bafefb9f497748fd5cd131ae049ad0ad800d`; notifications feature reserved to C. English master and Korean counterpart reviewed, not modified.
- Open PRs 89, remote branches 93 (including main). Known merge conflicts: #1143, #1110, #1107. Unique/unmerged changes preserved; no deletions.
- QA v1209 and RELEASE HOLD reviewed: shared live DB / least-privilege findings, security audit, migration 266, official Test exact-SHA remain blockers.
- Scope: P1 owner-only *latest-50* WLD cash-flow snapshot (incoming, outgoing, net, internal pocket moves) with server-authoritative signed ledger postings. No invented full-history totals, no reward or ledger writes, no schema migrations. Avoid B/C notification/shop/derivatives work.
- Branch `auto/hourly-a-wallet-flow-20261025-0225`; isolated worktree; no changes to other worktrees.

## In progress
- [ ] RED regression tests for signed WLD precision, internal movements, owner boundary, fail-closed errors, Android gateway contract.
- [ ] Implement Nest service/controller, member UI and Android app-api pass-through; no direct DB table grants.
- [ ] Test full gates and isolated real PostgreSQL (read-only); re-fetch main/planning mid-work.

## Finished
- PENDING. No merge, Test or Production promotion without every required gate.
