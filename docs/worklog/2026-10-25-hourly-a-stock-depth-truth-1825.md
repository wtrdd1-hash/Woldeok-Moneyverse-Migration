# Development A — Verified stock depth availability (2026-10-25 18:25 KST)

## Before work
- Status: IN PROGRESS / RELEASE HOLD. Host Debian 13.6; backend, frontend, nginx, docker ACTIVE; root disk 97% used, data disk 58% used.
- Main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; branch `auto/hourly-a-stock-depth-truth-20261025-1825` from latest main in isolated data-disk worktree.
- Repository `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, `.ko.md`, `INTEGRATED_PLANNING_MASTER.md`, applicable skills, issue #1273 and previous QA were inspected. No root-level PROJECT_PLAN exists; canonical plans are under `docs/planning/`.
- Baseline remote branches 173, open PRs 169. Development C #1272 owns verified execution events inside `stock-orderbook.tsx`; avoid changing that file. Other workers' branches/PRs protected.
- P1 defect #1273: fabricated client-generated bid/ask depth appears as real liquidity; no proven persisted authoritative open-order depth. Implement a truthful server-confirmed depth availability state and an explicit no-depth web view, preserving live quote and manual order entry. No ledger, migration, or direct app DML changes.

## In progress
- [ ] Write RED tests for API contract, server status, web unavailable display and Android gateway.
- [ ] Implement backend public status sourced from existing DB-backed stock catalogue, expose through web + Android app-api, suppress fake depth from actual rendered page without changing C's component.
- [ ] Run focused tests, full required gates, isolated real PostgreSQL least-privilege checks and exact-SHA Test if available.
- [ ] Re-fetch main and living plans mid-work and before integration; protect unmerged branches.

## Finished
- Pending. No merge or production release without all gates PASS.
