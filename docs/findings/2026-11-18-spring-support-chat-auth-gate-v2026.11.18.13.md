# Support/Chat Identity & False-Success Gate — v2026.11.18.13

Status: SOURCE-OBSERVED RISK / P0 INTEGRATION HOLD; NOT AN EXPLOIT TEST
Date: 2026-11-18 KST
Scope: read-only review of the mini-PC source baseline; runtime auth E2E not conducted.
Related: admin + global chat preview branch, Spring recovery PR #3267.

## Specific source observations
1. `spring-backend/src/main/java/com/moneyverse/api/domain/support/controller/SupportController.java`: `resolveUserUuid` accepts `X-User-Id` or `x-actor-user-id` and uses a fixed fallback UUID for malformed/missing input. Thread and message methods pass that selected actor into service methods.
2. `spring-backend/src/main/java/com/moneyverse/api/domain/chat/controller/ChatController.java`: same identity-header and fixed fallback selection for user conversations/messages.
3. `spring-backend/src/main/java/com/moneyverse/api/domain/support/service/SupportService.java`: `listThreads`, `summary` and `listMessages` return `success:true` with empty data after exceptions; `createThread` catches database failures and can return `success:true` with a synthetic thread object. This blurs authoritative success/unknown/error.
4. `frontend/src/components/route-aware-floating-utilities.tsx`: `/admin` routes intentionally suppress the currently implemented member floating support widget.

## Security implications and verification limits
A client-provided identity header must not be an authoritative signed-in principal; otherwise a missing or bypassed trust boundary can expose cross-member records. A fixed fallback identity increases confusion and risk. A ticket creation acknowledgement must be based on an actual committed write/receipt rather than a locally fabricated fallback. These findings are code-level and do not assert that a live exploit has been demonstrated.

## Required owner-side remediation
- Resolve principal only from authenticated, server-validated session/security context; remove any untrusted identity-header and hardcoded actor fallback in these controllers.
- Authorize every thread, message and group resource per member/role on the server and the existing least-privilege database functions.
- On DB/unavailable failures return a real error code and error state; never `success:true` without an authoritative receipt. Preserve idempotency for writes.
- Add unauthenticated 401, cross-user 403, invalid actor, unknown/timeout 503, idempotent duplicate request and full authenticated member/admin E2E test cases.
- Coordinate changes with ongoing Spring security work (#3267) rather than editing the same source in the UI design branch.

**Current result:** No Java or deployed frontend files modified here. User-facing global chat remains disconnected until separate security/QA completion.
