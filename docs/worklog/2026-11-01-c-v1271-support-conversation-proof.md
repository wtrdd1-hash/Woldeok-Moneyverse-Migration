# Development C v1271 — Member support conversation source integrity

## START / 2026-11-01 19:46 KST
- Base: `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` (fetched origin/main).
- Scope: `/support` member thread/message source integrity, verified empty vs unavailable, accessible retry; reuse authenticated Nest support API and owner-scoped PostgreSQL `support_my_threads` / `support_thread_messages` functions (migration 196).
- Evidence: current Next page destructures unchecked `api` response and renders unchecked message rows; a successful but malformed envelope can throw, while a message-fetch error crashes the page. It cannot distinguish verified empty from unavailable. Existing B #2251 owns HTTP privacy; no duplicate changes. A #2362 announcements, B #2363 seasons, QA #2326 arcade and C #2360 admin analytics have separate scope.
- Plan: TDD RED malformed envelopes and failed messages; GREEN validated member source + accessible retry + no reply/download on unverified history; verify full gates; no migration/ledger write.
- Isolation: fresh `auto/hourly-c-support-conversation-proof-v1271-20261101-1945` worktree, main untouched. GitHub release HOLD.

## MID / IN PROGRESS
- Pending tests and code.

## END / PENDING
- No merge/Test/Production before all gates PASS.
