# C v1124 — Verified Administrator Money Flow Evidence (canonical)

## Before work
- Base main: a28bed9aa40ff74d492824ae12892a7d52132fdd (fetched 2026-10-28 14:42 KST).
- Isolated branch: auto/hourly-c-money-flow-evidence-v1124-20261028-1445.
- Reviewed AGENTS.md, README.md, README/README.ko.md, docs/planning/PROJECT_PLAN.md and .ko.md, active PRs #1691/#1697/#1695, QA #1687, and latest A/B work.
- Confirmed Debian 13.6, seven services active, PostgreSQL connected. Production database must not be modified.
- Evidence from main: /admin/money-flow silently treats API failure as zero activity, invents 831 transactions and 13 users, claims 100% ledger reconciliation without a reconciliation receipt, and converts exact WLD amounts with Number(). Backend endpoint exists at /api/v1/admin/treasury/user-money-flows with summary and keyset cursor.
- Scope: one P1 read-only frontend/backend contract integration; no new DB writes or migrations.

## Plan / TDD
1. RED: test invalid/failed backend response, exact WLD values >2^53, verified summary and pagination, admin gate.
2. GREEN: validate complete server response and fail closed; use canonical money formatter, real counts and honest reconciliation disclosure.
3. Run focused, full and isolated PostgreSQL gates on exact SHA; re-fetch main before merge; hold PR if any required gate fails.

## In progress
- Worktree created; tests and implementation pending.

## Finished
- Pending exact-SHA verification and release decision.
