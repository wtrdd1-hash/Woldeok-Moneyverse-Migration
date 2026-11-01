# C v1255 — Advisor source truth and execution hold

## Before work — 2026-11-01 09:45 KST
- Host Debian 13.6 connected; seven services active; dev PostgreSQL connected.
- Base `f13bbce273ffc65e8576170992d82ea00c27a1c9`, isolated `auto/hourly-c-advisor-source-truth-v1255-20261101-0945` worktree. Reviewed AGENTS, EN/KO README and living plans, open PRs, A/B and QA v1433; no open advisor PR.
- P0 proof: `/api/advisor/deoki/rebalance/execute` returns fabricated `success:true`, `SIMULATED_FILLED`, 1,200,000 WLD and invented execution IDs without ledger execution, while `/advisor` claims immediate filled trades. Backend advisor diagnosis requires a durable receipt INSERT, so no fallback should be invented if source unavailable.
- Scope: refuse all unledgered rebalance executions; make advisor diagnosis a validated read-only source view with honest unavailable state; remove fabricated ratios/yields/AI guarantees; add regression tests for authentication, private headers, source shape, mobile and accessibility. No DB grants, money writes or Production changes.

## Plan / checkpoints
- [ ] RED: reproduce fabricated rebalance and unsafe diagnosis contract with failing tests.
- [ ] GREEN: fail-closed rebalance endpoint and validated diagnosis BFF; accessible honest UI.
- [ ] Verify exact HEAD tests/build/lint/typecheck/API/DB/security/CI/E2E, re-fetch main, preserve HOLD on any blocker.

## In progress
- Pending.

## Finished
- Pending.
