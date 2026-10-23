# Wallet history cursor pagination — Development A, 2026-10-24 03:25 KST

## Scope and authority
Existing `/wallet/activity` and `/api/v1/wallet` stop at 50 records; members cannot inspect older WLD ledger activity. Implement an **additive, read-only** owner-scoped `GET /api/v1/wallet/history` endpoint with stable `(created_at, id)` keyset pagination anchored to a DB-resolved transaction UUID and a server-rendered `?before=<transaction-uuid>` activity continuation. Keep the existing overview and its 50-record cap unchanged. The existing Android `/app-api/v1/wallet/history` gateway must preserve authentication, query parameters, and no-store semantics. No migration, financial mutation, or privileges change.

## Safety invariants
Require authenticated user from server session, not query; validate the cursor UUID and resolve the full-precision timestamp inside PostgreSQL; page size fixed at 20 with a 21-row lookahead; stable DESC order with strict `<` cursor with foreign/unknown cursor yielding no rows; aggregate only caller's USER_CASH/USER_BANK postings. Preserve canonical integer strings, do not cache private responses, never render an invented zero. Empty/invalid cursors fail closed. Backward compatible with earlier wallet receipts PR #1049 (which edits the activity page); retain both changes during review.

## Test-first steps
1. Add RED repository SQL-shape and cursor-validation tests; add controller/service pagination tests; add frontend next-link tests and app-api forwarding tests.
2. Implement minimal repository query, service mapping, controller endpoint, activity pagination UI, gateway no-store header protection.
3. Verify targeted tests, backend/frontend suites, lint/typecheck/build/security, real PostgreSQL owner-scoped read, exact-SHA CI. Never merge/promote if required gates fail.
4. Re-fetch main/plan mid-work and before PR. Record changes, SHA, branch counts, CI and Test/Production HOLD.

## Rollback
Revert the additive branch/PR; no schema, ledger, or production state changes. Existing `/wallet?recent=50` and original activity page continue working on main.
