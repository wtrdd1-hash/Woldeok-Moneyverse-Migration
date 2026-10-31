# Development A — owner shop holdings attention filter repair

## Before work (2026-10-31 18:12 KST)
- Baseline origin/main: 5bccda44d6db56aff05fa5623ef7f72b2ec0263c. Isolated worktree: /srv/moneyverse-data/tasks/mv-a-20261031-1812-holdings-attention/repo; branch auto/hourly-a-20261031-1812-holdings-attention-repair.
- Start inventory: 108 remote branches including main, 94 open PRs. Recent QA v1417 inspected; exact-SHA release evidence must be revalidated.
- Source gap: member shop/catalog sends  but Nest shop/holdings accepts only ; the backend ignores , so the screen can falsely label all holdings as overdue. Backend filtering also omits positive  with zero unpaid weeks, despite an existing bigint-safe helper. Android app-api does not independently validate this filter or enforce private response headers on shop/holdings.
- Constraints: use existing actor-scoped  PostgreSQL function; no migration, no direct table GRANT, no ledger writes. Avoid B #2136 (owner holdings privacy) duplication where possible; maintain separate PR and preserve their branch.

## In progress
- [ ] RED: backend and frontend/app-api regression tests reproduce mismatch and stale HTTP 200.
- [ ] GREEN: align query token, strict backend parsing and BigInt-safe attention predicate.
- [ ] GREEN: app-api rejects duplicate/invalid filter and unverified 200; protect owner headers.
- [ ] Verify database function execution and ACL, build/lint/typecheck/test/contract/CI, exact SHA, Test/Production gates.

## Finished
- Pending verification. No integration, deployment, service restart, production database mutation or branch deletion permitted without release evidence.
