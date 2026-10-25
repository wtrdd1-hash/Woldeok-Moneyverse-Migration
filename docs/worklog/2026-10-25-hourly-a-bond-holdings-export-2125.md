# Development A — owner-only virtual bond holdings export (2026-10-25 21:25 KST)

## Before work
- Source main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fetched). 189 remote branches, 185 open PRs; do not delete unique tips.
- Host Debian 13.6; backend/frontend/nginx/docker active; root disk 98%, data disk 63%.
- Read `AGENTS.md`, `README.md`, canonical English `docs/planning/PROJECT_PLAN.md`, secondary Korean `docs/planning/PROJECT_PLAN.ko.md`, integrated planning, recent QA #1317 and planning #1329, open PRs/CI. Root `PROJECT_PLAN.md` does not exist; plans live under `docs/planning/`.
- Scope: P1 owner-only **current virtual bond holdings** CSV export. Existing `bank_get_my_standing(actor)` is owner-scoped, SECURITY DEFINER, and returns only `status=holding` bonds; no historical redeemed holdings or guaranteed settlement claim. No ledger writes, no migration.
- Assumption for delegated non-interactive run: implement a bounded, fail-closed, authenticated export with source provenance, exact integer strings, CSV injection protection, Android app-api parity. Other developers' changes remain untouched.
- Plan: (1) RED tests for backend holdings read, CSV serialization, gateway contract; (2) implement Nest GET and owner-scoped DB function reuse; (3) Next CSV route and bank link; (4) GREEN tests; (5) full gates, real isolated PG, CI and release HOLD decision. Never merge on red.

## In progress
- Worktree `auto/hourly-a-bond-holdings-export-20261025-2125`, isolated from main and all other tasks.

## Finished
- Pending exact-SHA verification and gate evidence.
