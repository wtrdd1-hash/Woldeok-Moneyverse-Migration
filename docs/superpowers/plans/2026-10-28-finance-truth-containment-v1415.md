# Finance Truth and Financial Action Containment — v2026.10.28.1415

> **For agent:** Execute in isolated worktree using TDD, systematic debugging and evidence-first release gates.

## Architecture boundary
Authority PROJECT_PLAN → INTEGRATED_PLANNING_MASTER → v523 → v542. This v1415 stabilizes unsafe production-facing paths, NOT a fully certified fiscal settlement implementation. Preserve all existing WLD and immutable migrations; do not change actual production DB. Never claim unavailable evidence as a financial success.

## Task 1: Public treasury truth
- RED: frontend `treasury-public-state.test.ts` asserting no hard-coded balances/ledger/eligibility and explicit `UNVERIFIED` state.
- GREEN: central fail-closed projection helper used by `/treasury` page and `/api/treasury/overview`; remove synthetic 25M/3.42M/1420 and fabricated recent transactions. No admin-only API call from public route.
- UX: show verification warning, unverified gauges and unavailable ledger state; preserve public reference information without guaranteeing actual disbursement.

## Task 2: Legacy mint and central bank boundary
- RED: backend tests on legacy controller routes to ensure fabricated mint/burn, policy rate and reserves never report settled financial success.
- GREEN: return explicit 503 with stable codes for in-memory legacy reads and money-changing writes. For DB monetary controller, block mint execution and manual auto-regulation; do not disturb policy read or emergency freeze.

## Task 3: SWF SQL and unsafe mutation containment
- RED: SQL bind type contract tests for failing liquidation audit statement; test admin endpoints reject unsafe execution.
- GREEN: explicit PostgreSQL casts on ambiguous audit params; return 503 for manual rebalance/liquidation until matching canonical double-entry receipt exists. Database config GET remains available.

## Task 4: verification and handoff
- Run focused tests, frontend/backend typecheck/lint/build where feasible; compare remote main mid-work; inspect conflicts and production/test identities.
- Write start/middle/end worklogs and internal/GitHub updates. Push unique branch, open Draft PR, inspect CI and official isolated Test readiness. No production cutover unless full authenticated finance/ACL/migration/reconciliation gates pass at exact SHA.
