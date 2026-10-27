# Verified notification read-all receipt — bounded design and implementation plan

## User outcome and scope
A member pressing **Mark all read** must not be told that the unread count is zero merely because an update request succeeded. Concurrently arriving notifications may remain unread. The web and Android gateway must offer a verified post-update count, with the existing legacy Android integer endpoint preserved. This is a P0 integrity subset of planning v1370; it does not implement support reply outbox, change notification ownership, mint rewards, or modify applied migrations.

## Chosen design
- Add an authenticated, consent-gated, CSRF-protected `POST /notifications/read-all-receipt` endpoint. Keep existing `/read-all` unchanged for compatibility. Reuse the existing PostgreSQL owner-bound `notification_mark_all_read` and `notification_unread_count` functions, in sequence, returning `{ updatedCount, remainingUnreadCount }`. The second value is the DB observation *after* mutation, not a guarantee about later arrivals. Reject malformed counts.
- Next same-origin POST BFF invokes the new endpoint and validates both fields. Never optimistically set the badge to zero. On receipt, invalidate stale fetches, render the server count and refresh the feed. On failure, show unknown rather than a fabricated zero. Do not expose another user's notification content.
- Register the new endpoint in Android app-api contract, preserving the old read-all contract. Ensure private/no-store headers, CSRF, actor scoping, no money movement.

## TDD tasks
1. Add backend RED tests for positive remaining count, malformed count, actor-scoped SQL and controller receipt; then minimal service/controller implementation.
2. Add web RED tests for concurrent notification arrival and invalid receipt, plus Next BFF contract test; implement minimal fail-closed refresh behavior.
3. Update Android app-api contract and generated references; add contract/gateway regression. Run isolated real PostgreSQL function test without touching live DB.
4. Full lint/typecheck/test/build/security/CI gates, exact SHA and release HOLD evidence; never merge or deploy on failure.

## Rollback
Prior to merge close this Draft PR. After an approved deployment, revert only the new route/client changes; the legacy endpoint and immutable SQL remain unchanged. No production migration or data rollback.
