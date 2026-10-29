# v2026.10.29.1511 — Treasury service incident / validation log

## BEFORE WORK — 2026-10-29 22:19 KST
- User-directed scope: repair malfunctioning Treasury-related services; no fake financial success or unsupported ledger mutation.
- Source of truth: `docs/planning/PROJECT_PLAN.ko.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, `docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.ko.md`, `AGENTS.md`, v1401 audit, and treasury v633/v1159 notes.
- Started from fetched `origin/main` 0a4327f73e0d2d4dc5deb614a1bb9b8cb04ee6d2 in independent worktree; existing checkout has other agents' uncommitted work and is untouched.
- Production Nginx points to v1502 on 127.0.0.1:3564/3565, backend `/health`=HTTP 200, `/api/version` source c2129625aa66; this is NOT proof that Treasury money movement works.
- Historical findings: canonical Treasury funding / ledger links not independently reconciled, original public synthetic metrics were replaced with explicit unverified state in main, B v633 and C v1159 fail-closed revenue/expenditure work. Keep grants/dividends/donations/bonds/SWF fail-closed unless independently proven.
- Disk capacity: root 79%, second data disk 78%; do not alter others' workspaces. Authorization: existing app finance DML grants explicitly accepted; do not use that alone as release blocker.

## IN PROGRESS
- [ ] Compare current main and live production Treasury routes and inspect operational errors (read only).
- [ ] Isolate one reproducible defect and add a regression test; fix only a bounded contract without financial balance modification.
- [ ] Re-fetch main and integrated plan midway; test isolated source, backend health, no-store/auth contracts, and candidate test server where feasible.
- [ ] Write versioned internal/GitHub update, register PR and track CI / release evidence.

## FINISHED
- Pending verified outcome and deployment decision.
