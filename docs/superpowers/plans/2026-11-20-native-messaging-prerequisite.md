# Native support and direct-message API prerequisite

> Execute inline with Superpowers TDD. This refines Task3 of the approved native shared frontend plan; the November18 authority remains binding. Owner approved frontend implementation and checkpoint publication. No additional discovery approval is needed.

**Spec:** docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md
**Goal:** Make existing Spring support/chat contracts safe enough for the native panel to consume; do not enable UI sending until verified.
**Architecture:** MemberApiGuard derives actors from verified sessions and validates CSRF. Services call only existing owner-scoped SECURITY DEFINER functions. A small messaging contract helper validates caller intent, exact receipts and safe errors. No migration, new store, direct table grant or provider change.

## Constraints / rulings
- Keep the original checkout untouched; task branch is feat/nov18-native-frontend-v20261120 on MiniPC. Existing auth worker is isolated and touches no messaging files.
- New message body maximum1000 Unicode code points. Reject null/blank/NUL/unpaired surrogates. Chat's existing database control-character restriction remains visible as rejection. Do not truncate content.
- Retry keys are canonical UUID strings supplied by callers; never generate replacements server side. Existing JSON field remains supported; if an optional Idempotency-Key header is supplied it must match the body.
- A successful support creation needs a canonical UUID, valid status and timestamp. Replies and DM sends need UUID, exact body and timestamp; DM sequence is a positive canonical integer string bounded by PostgreSQL bigint. Missing or mismatched receipts are503.
- Reads fail unavailable on source failure and forbidden on deliberate owner refusal; no successful empty fallback. Raw SQL/private bodies never enter error logs/responses.
- Existing support summary covers only recent100 rows; do not label this as lifetime totals. Unread int counts must be nonnegative canonical values in range; missing/overflow does not become0.
- No API creation for opening arbitrary new conversations without a source-backed recipient flow in this step. No real user messages, shared DB or production mutations in tests.

## Task1: Verified HTTP boundary
Files: SupportController.java, ChatController.java under spring-backend/src/main/java/com/moneyverse/api/domain; new domain/messaging/MessagingHttpBoundaryTest.java in test sources.
1. Add MockMvc regressions: every existing read/write alias denies anonymous forged headers; authenticated reads use session owner despite headers; absent/wrong CSRF denies writes without invoking services.
2. Observe RED on currently accepted forged requests.
3. Inject existing MemberApiGuard; remove identity-header/fixed-UUID resolution. Add reply POST /threads/{id}/messages using the existing DTO and function contract.
4. Add real-session guarded mutation and stable retry-key/receipt HTTP evidence with synthetic service boundaries; verify no API routes conflict with native page routes.
Expected: focused HTTP tests green; no live database calls.

## Task2: Exact request and receipt contract
Files: SupportService.java, ChatService.java, ChatDtos.java; new domain/messaging/MessageContract.java and MessagingServiceContractTest.java.
1. Add service tests for missing/malformed keys, blank/1001-codepoint/control/malformed UTF16 bodies, exact1000-codepoint acceptance, caller-key reuse, incomplete/mismatched receipt, denied/unavailable histories and bigint string serialization.
2. Observe expected RED against current random keys, fabricated empty reads and long sequence.
3. Implement shared validation and generic SQLSTATE mapping. Reuse current SQL wrapper functions; add support reply service with exact post-write receipt. Do not catch validation failures as source outages.
4. Keep malformed canonical read fields unavailable; valid empty lists/zero unread remain truthful.
Expected: focused behavioral tests green; SQL invocation/ownership is asserted with JDBC boundary doubles because PostgreSQL functions do not run in the isolated H2 suite. Report this limitation.

## Verification / review focus
Run isolated Spring full test plus bootJar with test storage, Node scripts suite, git diff --check. Review actor/CSRF binding, no swallowed errors, exact keys/sequence/body receipts, and unchanged SQL privileges. Fresh whole-branch reviewer is required. Browser message sending, concurrency/replay against real PostgreSQL, public Test and production remain unverified and HOLD.
