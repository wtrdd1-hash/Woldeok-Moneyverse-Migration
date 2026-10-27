# Development B v578 — Safety moderation queue query integrity (DRAFT / HOLD)

- Start: 2026-10-27 10:36 KST; baseline main: 5888176454648f51d5f986be60a22847bd234777.
- Branch: auto/hourly-b-safety-queue-strict-v578-20261027-1035; independent worktree: /srv/moneyverse-data/build-workspaces/mv-b-v578-20261027-1035.
- Scope: P1 fail-open invalid moderator queue filters and ambiguous pagination, without altering financial data or migrations.
- Evidence: \ silently converts malformed filters to unfiltered 50/0; \ uses permissive parseInt and clamps malformed input. Both return sensitive admin records.
- Coordination: C Draft #1485 handles frontend moderation queue; do not modify its branch or UX. B #1465 concerns chat bigint, unrelated controller.
- [x] Read AGENTS, README, EN/KO planning, current main, open PRs and CI context.
- [ ] RED tests for invalid status, noninteger/oversized pagination, and valid filters.
- [ ] GREEN implementation with strict shared Zod query contract and HTTP 400.
- [ ] Focused/full tests, lint, typecheck, build, app-api, isolated PostgreSQL and security audits.
- [ ] Record exact SHA CI, official Test SHA and release blockers. No merge or Production until every required gate passes.

## API contract
Existing GET /api/v1/admin/safety/takedowns and /api/v1/admin/safety/chat-reports retain response fields. Optional status uses existing per-queue enums. Optional limit defaults 50 (1..100 integer), offset defaults 0 (nonnegative safe integer). Malformed or unsupported query values => HTTP 400, no repository invocation; valid values forwarded unchanged. No DB schema/role/ledger change.

## Progress / evidence
- Start main SHA: 5888176454648f51d5f986be60a22847bd234777. No Production, Test, database or other worktree writes.
