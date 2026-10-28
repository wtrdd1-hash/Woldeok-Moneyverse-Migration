# Member support transcript export — A1525 design and implementation plan

## User intent and boundaries
Provide a self-service, owner-only CSV export of the first 500 messages in chronological order of a support conversation, with an Android-compatible JSON representation. This is a read-only P1 member convenience/privacy feature; it is not a complete data portability export. The limit is explicit in the UI and API response, and `truncated=true` indicates a possible additional history. No read receipts, no synthetic data, no balance or ledger mutation.

## Design choices
1. Backend GET `/api/v1/support/threads/:id/transcript` requires session, active authentication, consent; actor derives only from session. Reuse `public.support_thread_messages(actor, thread, 500)` which enforces owner access in PostgreSQL, with no direct table grants and no migration. Return `{threadId,messages,truncated}`; no private caching.
2. Next server-only GET `/support/transcript/[id]` requires membership and requests the same API. Convert to safe UTF-8 CSV with formula-prefix neutralization, no user-controlled filename, `attachment`, `nosniff`, `private, no-store`, `noindex`; fail closed on malformed UUID and upstream error.
3. Add accessible link on `/support` for the selected conversation. Android app-api supports the JSON endpoint through the existing `support` group, with cache/noindex override even on failures.
4. Add RED tests for controller guards/owner-bound repository, CSV safety, and app-api privacy. Verify full backend/frontend/DB/bot/build/lint/typecheck/security/contract; Test exact SHA and GitOps required before integration. Do not deploy if any gate is absent.

## Execution
- Task 1: Add backend RED tests; implement minimal read-only controller/repository endpoint.
- Task 2: Add Next CSV RED tests and safe download route; add accessible UI link.
- Task 3: Add Android gateway RED cache tests and enforce no-store/noindex.
- Task 4: Run targeted tests then full gates and real isolated PostgreSQL where possible; inspect latest main, PRs, CI and record exact SHA.
- Task 5: Push isolated branch, open Draft PR, report any BLOCKED gate; never merge or deploy without exact-SHA release evidence.

## Risks and rollback
500-message cap is not a complete historical export; label it accurately. User-provided message text may contain spreadsheet formula injection; neutralize at CSV boundary. A foreign UUID must not return any message or metadata. Rollback is reverting this branch/PR; no schema, production data or ledger changes.
