# Backend B v754 — Admin broadcast delivery truth (2026-11-02)

## Before work
- Base: `origin/main` at `a8541927c3a351d980454c66e95a3356c47e0722` (start and mid-run fetch); separate branch/worktree.
- Reviewed `AGENTS.md`, `README.md`, English/Korean project plans, planning Draft #2478, QA v1464, concurrent A #2480/C #2479, and open PRs/CI. This endpoint has no known active Next.js client call on main; the legacy API path remains.
- P1 source defect: `POST /api/v1/admin/messages/broadcast` enumerated only 100 users, skipped individual delivery errors, emitted an audit with `recipientCount` and answered `success:true` without a durable recipient delivery receipt or replay key. A retry could send duplicates. A 100-row slice is not the complete audience.

## In progress — RED / GREEN
- Authenticated HTTP regression tests for 2- and 101-member cohorts returned **201** rather than expected **503** before the fix; guard metadata test passed. Test mocks were adjusted to attach an authorized session before the valid RED result.
- The route now fails closed with HTTP **503**, `ADMIN_BROADCAST_DELIVERY_UNVERIFIED`, without querying recipients, creating conversations, sending messages, or claiming audit/delivery success.
- Existing `SessionGuard`, `AuthenticatedGuard`, `ConsentGuard`, `AdminGuard`, `AdminSessionGuard`, `CsrfGuard` are preserved; direct-message send remains unchanged.
- No database schema/migration/grant, WLD, financial ledger, or external message is changed by this patch. Existing client must show unavailable, not sent. A future implementation requires a durable idempotency key, complete cursor-bounded recipient snapshot, per-recipient transactional outbox receipts, retry semantics, failure visibility and independent E2E.

## Finished / release hold
- Focused HTTP/admin regression: 7 PASS. Full verification and CI evidence are in task logs/PR; do not infer Test or Production readiness from focused tests.
- QA v1464 P0 blockers remain: broad Production app-role DML, five applied migration checksum mismatches, official Test app/migrator target divergence, exact-SHA Test and independent restore not certified.
- DRAFT / RELEASE HOLD. Do not merge or promote until required full gates and official Test exact candidate SHA pass. No shared DB, Test, Production or other workers changed.
