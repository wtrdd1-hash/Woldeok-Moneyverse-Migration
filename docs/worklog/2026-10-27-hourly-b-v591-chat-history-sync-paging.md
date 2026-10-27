# Backend B v591 — Private chat history/delta page limits (DRAFT / HOLD)

## Context / scope
- Baseline remote main: 59cdc2e02f0e83e5401049309c4cb89ff57c2d4c.
- QA v1324 release gate remains FAILED. Existing PR #1465 handles bigint chat cursors; this patch handles only limit on message history and delta sync. Existing merged PR #1527 handles conversation list and user search.
- Root cause: Number.parseInt accepted prefixes (2junk, 1e2), while repository Math.min/Math.max silently clamped invalid direct-call page sizes.

## Changed API contract
- GET /api/v1/chat/conversations/:id/messages: absent limit defaults to 50; canonical decimal integers 1..100 accepted; invalid/duplicate/non-string values return HTTP 400 before service/SQL.
- GET /api/v1/chat/conversations/:id/sync: absent limit defaults to 100; canonical decimal integers 1..200 accepted; invalid/duplicate/non-string values return HTTP 400 before service/SQL.
- Repository direct calls reject unsafe, fractional, NaN, Infinity, zero, negative, and out-of-range page sizes; no silent coercion.
- No route, success response, auth/session/consent, bigint cursor contract, schema/migration, privilege, financial ledger, or WLD changes.

## Test-driven evidence
- RED on baseline: 42 failing assertions among 50 new focused controller/repository cases (full backend command also executed; unrelated tests passed).
- GREEN: 90/90 focused controller/HTTP tests including pre-existing list/search cases.
- Isolated real PostgreSQL 17.11: 4/4 PASS with synthetic messages and read-only SQL role; exact 2-row windows, participant-only scope, mutation denied (42501). Test container deleted.
- Root pnpm test: FAIL on pre-existing duplicate migration number 280. Draft #1564 is separately addressing that, without altering applied migrations.
- Additional gates and CI: see PR check runs and final run note; a passing focused test does not authorize merge.

## Integration / safety
- PR #1465 changes beforeSequence/sinceSequence and read receipts in the same controller/repository files. Integrators must preserve its bigint string semantics alongside these strict page limits.
- Work was isolated from development A/C, Gemini and QA; no other branches, worktrees, services, DB or deployment pointers changed.
- DRAFT + hold; no main merge, official Test promotion or Production deployment until full security, root test, CI, authenticated exact-SHA Test E2E and approved GitOps gates pass.
