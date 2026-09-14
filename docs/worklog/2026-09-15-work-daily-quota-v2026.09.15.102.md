# Internal work log — v2026.09.15.102

## Trigger

The Android client exposed an overly broad administrator restriction and could not present/fill the intended daily work amount because the backend task board returned `daily_limit = 0`.

## Findings

- `work_task_catalog.daily_limit` already contains the authoritative per-task limits.
- Migration 166 changed `work_task_board()` to emit `0` for `daily_limit` and changed direct completion into unlimited repeat mode.
- The mobile schema still requires `daily_limit` and `taken_today`, so the implementation had drifted from its own API contract.
- `taken_today` was derived from assignments, which incorrectly consumed apparent quota even when work was never completed/rewarded.
- The operator feature switch and member quota are separate concerns and must not be represented by one number/state.

## Work stages

1. `v2026.09.15.102-01` — re-read Living Project Plan and current main before editing.
2. `v2026.09.15.102-02` — traced work repository, migration 166, migration 157, task seeds, and mobile schema.
3. `v2026.09.15.102-03` — added migration 189 restoring real board limits and completion-count semantics.
4. `v2026.09.15.102-04` — added direct and legacy payout quota enforcement with a shared advisory lock.
5. `v2026.09.15.102-05` — updated stale work-board DB expectation and added dedicated quota DB coverage.
6. `v2026.09.15.102-06` — re-read Living Project Plan midway; no product-spec rewrite required because this is a regression fix.
7. `v2026.09.15.102-07` — pending CI, merge, isolated Test exact-SHA/backend-DB smoke, then same-SHA Production promotion.

## Files

- `packages/database/migrations/189-work-daily-quota-contract.sql`
- `backend/src/work/work-board.db.test.ts`
- `backend/src/work/work-daily-quota.db.test.ts`
- release/worklog documentation for v2026.09.15.102

## Rollback

Applied migration 189 must not be edited. A rollback requires a later numbered migration. Existing receipts, assignments, job progress, and ledger entries must remain append-only/preserved.
