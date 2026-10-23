# A / 2026-10-24 06:25 KST — wallet activity direction filter (WORK IN PROGRESS)

- Start `origin/main`: `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede`; local `main` clean. Remote heads 43 including main; open PRs 41. No cleanup: every non-main head requires unique-commit preservation.
- Isolated worktree `/home/debian/worktrees/mv-a-wallet-direction-filter-0625`; branch `auto/hourly-a-wallet-direction-filter-20261024-0625`. Existing docs-only direction proposal on `auto/hourly-a-wallet-direction-20261024-0525` preserved.
- User-facing goal: filter authenticated recent wallet activity by net inflow, net outflow, or net-zero pocket movement, before the 50-row limit. No financial mutation, migration, or grants.
- Pre-existing blockers: main Next.js security audit (Critical 2, High 1), QA CSV lint and blog test pending in independent PR #1061, shared Test/Production DB report #1053, app-role DML #993, migration 266 checksum drift, official Test exact-SHA auth/ledger E2E not verified.
- Database: read-only owner aggregate only; do not issue writes because Test/Production DB isolation is unproven.
- TDD: tests written first; RED and GREEN evidence to follow. Release HOLD.

## In progress — TDD, implementation and safety checks
- RED observed at 06:24 KST: backend direction tests 6 failed on original source; frontend missing direction helper and Android wallet private-cache assertion failed.
- GREEN observed: backend direction 6/6 + existing pocket deltas 4/4; frontend direction + rendered page + Android app-api 15/15. SQL CTE computes signed owner cash/bank postings and applies exact `numeric` direction predicate before ordering/limit; `direction` is a bound parameter and invalid input is 400. Existing `recent` API behavior preserved.
- API/DB: read-only actual development PostgreSQL, one owner with 202 positive / 60 negative / 12 zero-net entries. Selected first 20/20/12 rows by direction, zero duplicates/misclassified. Whole ledger 877 transactions / 1,784 postings, zero imbalance. `moneyverse_app` has INSERT on 235 public tables, P0 HOLD. This is a selected owner/sample and does not prove global isolation or official Test readiness.
- `pnpm typecheck` PASS; `pnpm build` PASS; API contract parity PASS; changed-file ESLint PASS. `pnpm test` backend 1,319 PASS / 398 SKIPPED, frontend 1,386 PASS / 1 FAIL (existing blog title assertion). Database package separately 15 PASS / 3 SKIPPED. Whole lint FAIL on existing wallet CSV `no-control-regex`; QA #1061 owns repair. `pnpm audit --prod --audit-level high` FAIL: 2 Critical Next.js, 1 High Next.js, 1 High Zod; security PR #1069 remains separate.
- Initial code commit `e9766561e25f9d77ea2c4bcde52cb7652fa51be0`; pushed new isolated branch and opened Draft PR #1074. Existing 0525 docs-only plan branch and all other developer branches/PRs untouched.

## Finished state / release decision
- Source implementation is a **candidate**, not deployed. No migration, schema, DB role, ledger, Test, Production, GitOps, backup, rollback, merge or branch deletion was executed.
- Exact SHA CI and Test Candidate are queued/in progress as of 06:33 KST; final outcomes will be added to PR #1074. No PASS is inferred from pending stages.
- Blockers: whole lint, blog regression, Critical/High dependency audit, broad app DML, migration 266 provenance, Production/dev DB isolation (#1053), exact-SHA isolated Test login/auth/ledger E2E, backup/restore and release gate.
- Rollback: feature is not merged or deployed; preserve branch and PR. If later deployed, revert its GitOps image tag only after verifying an available prior image and database compatibility; no migration rollback is needed for this read-only change.
- Start remote heads 43 including main / open PR 41; after code push 44 heads / open PR 42. Deleted 0, preserved all unique branches; none proven fully integrated or safely redundant. Main remained `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` at start/mid/pre-integration.
- Release status: **PARTIAL / BLOCKED / PRODUCTION RELEASE HOLD**. English original release report with Korean secondary-language counterpart.
