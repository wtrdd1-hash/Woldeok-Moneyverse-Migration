# Backend B v507 — FX WLD mutation safety hold

## Before work
- 2026-10-24 14:31 KST: Debian 13.6 miniPC status and commands checked. File read MCP returned empty; server shell read `AGENTS.md`, `README.md`, both living plans and Superpowers instructions.
- Starting main: `49788d09494fed3e463651945b83386e87dd47bc`. Independent worktree `auto/hourly-b-fx-wld-write-failclosed-v507-20261024-1435`.
- Reviewed open A/C/QA/planning PRs and recent CI. P0 #1129: FX member swaps and forward margin/settlement directly mutate `account_balances` without authoritative ledger postings; production/dev DB sharing #1053 prohibits direct DB testing.
- Scope: immediate **fail-closed containment**, not a ledger implementation. Reject all four member-WLD-changing FX commands at both service and repository entry points; retain read-only FX views and reserve telemetry. API returns 503 and never claims successful settlement. No schema, migrations, WLD writes, or deployment.
- Follow-up required: independently design ledger-first SECURITY DEFINER functions, member receipt/idempotency and isolated PG concurrency verification before re-enabling.

## In progress
- [ ] Add RED tests proving all four unsafe commands are rejected before any SQL or notifications.
- [ ] Implement minimal service and repository fail-closed guards.
- [ ] Verify focused and full gates, CI, candidate SHA; document BLOCKED exact-SHA Test.

## Finished
- Pending.

### Implementation checkpoint
- RED: eight new safety assertions failed against original service/repository behavior. Original backend test command also hit missing contract dist; installed frozen dependencies and will build contract before focused rerun.
- GREEN implementation: explicit 503 safety hold in both service and repository before any FX WLD-changing DB command. Existing legacy success-path unit tests updated to assert fail-closed behavior. Read-only FX and reserve administration unchanged.
- GREEN: `pnpm --filter @moneyverse/backend exec vitest run src/admin/fx/fx-ledger-hold.test.ts src/admin/fx/fx.service.test.ts` = 17/17 PASS. Validation for below-minimum WLD amount remains unchanged before the 503 guard.
- Existing C #1130 and A #1127 overlap neither FX service nor repository. FX admin PR #1128 remains Draft; do not modify its worktree or branch.
