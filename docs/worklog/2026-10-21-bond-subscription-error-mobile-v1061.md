# v2026.10.21.1061 — Bond subscription rejection and mobile layout incident

## Before work (2026-10-21 KST)
- Screenshot reports `internal server error` when subscribing to one KTB-05Y bond (100,000 WLD), with crowded mobile subscription header and three overlapping tabs.
- Read `AGENTS.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.{md,ko.md}`, `docs/planning/PROJECT_PLAN.ko.md`, `docs/operations/production-deployment.ko.md`, `docs/operations/release-documentation-policy.md`, `docs/INFRASTRUCTURE.md`, and relevant source and debugging/TDD/verification skills.
- Baseline source: `origin/main` at `0d12f99b`. Other tasks use separate worktrees. Task branch: `fix/bond-subscribe-errors-mobile-v2026.10.21.1061`.
- Runtime observations: backend received four subscription requests; no verified purchase success. Read-only DB checks found the affected account's USER_CASH available balance was 51,351 WLD, below the 100,000 WLD face value. Repository throws ordinary `Error` for insufficient funds; Nest maps it to generic HTTP 500. No user money was moved by the inspection.
- Existing bond repository mutates `account_balances` and treasury vault tables directly, which conflicts with the ledger-first v544 plan; this separate integrity risk is NOT considered fixed by a UX/error hotfix.

## Planned / in progress
- [ ] RED regression tests: correct client error for low balance and invalid units; reject unexpected database errors without exposing internals.
- [ ] GREEN minimal backend validation/status mapping, preserving transaction rollback on failure.
- [ ] Fix responsive subscription header and three-tab selector without changing financing logic.
- [ ] Run focused tests, typechecks and lint; record exact results.
- [ ] Re-fetch main, reconcile changed source, report Test/Production reality; never bypass financial gates.

## Finished
- Pending verification and deployment evidence.

## In progress checkpoint (2026-10-21 10:23 KST)
- First focused test run: 6/7 expected failures before implementation. Patched typed domain HTTP exceptions and mobile layouts.
- Follow-up tests: 23/23 PASS (7 repository, 5 service, 11 ProblemFilter). Backend Nest build PASS; backend/frontend TypeScript PASS; Next production build PASS after installing workspace-local dependencies offline (external node_modules symlinks were initially rejected by Turbopack). ESLint: 0 errors, 16 existing UI warnings.
- Re-fetched origin/main: SHA remained `0d12f99b` at checkpoint. No migrations or live monetary writes performed. Pending GitHub CI/PR and operational Test evaluation.
