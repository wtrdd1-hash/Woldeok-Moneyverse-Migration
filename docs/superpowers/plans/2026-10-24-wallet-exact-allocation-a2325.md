# Wallet Exact Allocation — Development A 23:25

## Source / constraints
- Baseline: `origin/main` c9a868b1e622341e2daa8b936ddf0988eda9988e. Read AGENTS, README, EN/KO project plans, integrated master, QA v1209, INFRASTRUCTURE, RELEASING.
- Existing wallet radar converts member WLD balances to JavaScript Number, losing precision above 2^53 and producing invalid chart ratios for huge balances. The member-facing allocation must not invent values or move ledger funds.
- Other A PRs already cover wallet transaction filters, bank movement previews, loans and reward fail-closed paths. This independent feature is an exact cash/bank allocation snapshot, not a duplicate of those PRs.

## TDD / execution plan
1. RED: unit-test 100-digit cash/bank allocation, zero-total, missing/negative balance refusal and no transaction reads; API route/auth and Android gateway privacy tests.
2. GREEN: expose `GET /api/v1/wallet/allocation` using owner-scoped existing `balancesForUser` PostgreSQL SELECT; compute basis points via BigInt; no migrations/writes.
3. Show precise WLD pocket allocation card on `/wallet` and remove unsafe Number conversion from existing radar via BigInt-based percent math.
4. Android `/app-api/v1/wallet/allocation` must forward authenticated session and return private/no-store; add gateway regression.
5. Run focused and full tests, lint, typecheck, build, audit, real isolated PG read-only ACL, latest main and PR CI. No merge or deployment unless all release gates pass.

## Review/rollback
- No migration. Revert branch/feature if checks fail; preserve other developers' worktrees/branches. Production stays untouched unless exact-SHA official Test and GitOps release gates are proven.
