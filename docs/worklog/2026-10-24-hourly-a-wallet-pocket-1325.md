# Development A — Wallet pocket-specific transaction history (2026-10-24 13:25 KST)

## Start / pre-change
- Base `main`: `49788d09494fed3e463651945b83386e87dd47bc` (GitHub and fetched origin/main agreed).
- Independent worktree: `/srv/moneyverse-tasks/mv-a-wallet-pocket-20261024-1325`; branch `auto/hourly-a-wallet-pocket-20261024-1325`.
- Start GitHub non-main branches: 28; open PRs: 27. All unmerged/unique branches preserved; no deletions.
- Debian 13.6 miniPC backend/frontend/MCP/Nginx/Docker active; DB `woldeok_moneyverse_dev` is **potentially Production-connected**, no writes or migration allowed.
- Read: AGENTS, README, `docs/planning/PROJECT_PLAN.md` (EN), `.ko.md` (KO), integrated EN master, QA/worklog and open PR/CI. Existing wallet PRs #1096, #1115, #1121 are Draft, not merged. Avoid their direction/category/period, historical receipt and recent insight scopes.
- P0 release gates: app-role least privilege, production/dev isolation, full CI/security and exact-SHA authenticated Test. Release HOLD. No assumed PASS.

## Scope / checkpoints
- [x] Inspect source, policy, existing PRs and real system status.
- [ ] TDD RED for pocket-specific `cash`/`bank` owner-only transaction history with filtering **before** 50-row limit.
- [ ] Implement Backend repository/service/guarded API, frontend activity UI and Android app-api contract, no new migration.
- [ ] TDD GREEN and focused tests; full lint/typecheck/build/unit/contract/security, isolated PG read-only when safe.
- [ ] Re-read latest main and mutable plan at midpoint/pre-integration; CI, PR and release gates; document blocked evidence.
- [ ] Record end SHA, files, branches, CI, Test/Production/rollback and branch preservation.

## Status
STARTED; no code change or DB writes. Scope is owner-specific pocket movement history, not a financial transfer.
