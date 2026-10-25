# P1: Private Support Transcript CSV — Implementation Plan

## Decision
Use existing `support_thread_messages(actor, thread, limit)` SECURITY DEFINER function, not table grants or a migration. Expose an authenticated/consented read-only backend JSON endpoint, then serialize a private same-origin CSV in Next.js. Native Android consumes the same JSON through the existing app-api allow-list and member cookie. Never claim the first 500 messages are a complete transcript when the cap is reached.

## Steps
1. RED: Backend test verifies owner actor is forwarded to existing read function and 500-row limit, and that SQL owner refusal fails closed. Frontend tests verify CSV escaping (formula/controls/quotes), max 500 and bounded warning. Android test verifies authenticated cookie forwarding, private response headers and failure propagation.
2. GREEN: Add `GET /api/v1/support/threads/:id/transcript` with Session/Authenticated/Consent guards, UUID validation, owner-bound SQL read; include `truncated` when count hits 500. No direct table grants.
3. GREEN: Add Next.js `GET /support/threads/[id]/export` private route with member session and server-only API, no-store/noindex, safe content disposition; link from selected thread and handle failures without a fake file.
4. Run focused tests, lint/typecheck/build/full tests, security, Android contract, real isolated PostgreSQL owner/non-owner and rollback; record exact SHA and blocked gates.
5. Re-fetch main and living plans before integration. Only merge/promote after full CI and official exact-SHA Test user E2E, otherwise draft PR/HOLD.
