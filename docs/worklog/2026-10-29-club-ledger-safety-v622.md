# v622 — Club charter and project WLD settlement containment

Status: IN PROGRESS / HOLD. Base: `35971c600f25869c96f1c666d4b9f58927202730`.

## Evidence and scope
- Migration 222's `club_create` and `club_contribute_project` directly update `account_balances` and insert only `ledger_transactions` with `ON CONFLICT DO NOTHING`; neither writes balanced `ledger_postings` or returns an immutable replay receipt. An identical idempotency key can therefore still trigger a second debit/credit before the conflicting transaction row is ignored.
- This is source-level risk, not proof of a live member loss. No database migration or live financial operation is authorized in this task.
- Implement a fail-closed API/controller, service and repository boundary for both WLD-mutating paths. Preserve read-only club directory, roster, projects, feed and canvas. Keep existing migration bytes immutable.
- Coordinate overlapping `club.controller.ts` edits with Draft #1716 (directory paging). Frontend and Android must present an explicit unavailable state before this candidate is release-ready.

## Plan and checkpoints
- [x] Inspect main, AGENTS, README, English/Korean plans, open PRs, QA and CI; use isolated worktree.
- [ ] RED: prove both routes can call mutating services and repositories.
- [ ] GREEN: reject both routes with HTTP 503 and stable `CLUB_LEDGER_SETTLEMENT_UNAVAILABLE` code before DB access.
- [ ] Verify regression tests, lint, typecheck, build, security and API contract.
- [ ] Recheck latest main and CI; record Test exact-SHA and Production release gates.

## Release constraints
Unmerged source code does not protect live PostgreSQL. The `moneyverse_app` EXECUTE grants on legacy functions remain a DB-level risk and require a separate forward-only migration with isolated PostgreSQL ACL tests. No Production promotion while this or other mandatory gates are incomplete.
