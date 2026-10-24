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
