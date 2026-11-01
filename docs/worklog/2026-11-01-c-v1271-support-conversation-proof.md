# Development C v1271 — Member support conversation source integrity

## START / 2026-11-01 19:46 KST
- Base: `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` (fetched origin/main).
- Scope: `/support` member thread/message source integrity, verified empty vs unavailable, accessible retry; reuse authenticated Nest support API and owner-scoped PostgreSQL `support_my_threads` / `support_thread_messages` functions (migration 196).
- Evidence: current Next page destructures unchecked `api` response and renders unchecked message rows; a successful but malformed envelope can throw, while a message-fetch error crashes the page. It cannot distinguish verified empty from unavailable. Existing B #2251 owns HTTP privacy; no duplicate changes. A #2362 announcements, B #2363 seasons, QA #2326 arcade and C #2360 admin analytics have separate scope.
- Plan: TDD RED malformed envelopes and failed messages; GREEN validated member source + accessible retry + no reply/download on unverified history; verify full gates; no migration/ledger write.
- Isolation: fresh `auto/hourly-c-support-conversation-proof-v1271-20261101-1945` worktree, main untouched. GitHub release HOLD.

## MID / IN PROGRESS
- Pending tests and code.

## END / RELEASE HOLD — 2026-11-01 20:00 KST
- Two-stage RED: 4 page failures and 2 malformed-envelope failures reproduced. GREEN: 50/50 support tests. Source parser now rejects duplicate records, unsupported sender/status, non-string coercion traps, empty bodies and oversized envelopes.
- Source-code candidate `e10ddf02451d717c0f09aa860ff8bf84a22e3e47` full gates: lint PASS (0 errors, 1,022 warnings), typecheck PASS, frontend 2,911 PASS, backend 2,963 PASS/518 SKIP, frontend/backend build PASS, app-api 184 endpoints PASS, security floors 11 PASS, database unit 62 PASS/4 SKIP. Exact final docs/edge-parser SHA must be rerun; the source candidate gates alone are not final-SHA certification.
- Independent network-disabled PostgreSQL 17.11: 316/316 migrations PASS; owner 1 thread/1 message, foreign owner 0 threads, foreign message read denied, app role no direct SELECT on support_threads or INSERT on support_messages; container removed. No shared DB writes.
- Release blockers: full dependency audit FAIL (9 vulnerabilities: 1 low, 8 moderate), full-route QA FAIL (missing artifacts/qa/full-route-ledger.json), official Test serves bc8cd8a6... rather than this candidate, exact-SHA authenticated E2E/independent restore not certified, remote runtime CI pending. No main merge, Test deployment, Production, rollback, service restart or deletion. Existing A/B/QA/Gemini branches protected.
- Main refetched at start/mid/end: `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` unchanged. Final gate evidence to be appended to Draft PR #2365 without changing source code.
- Two-disk bundle/patch backup verified SHA-256; after final commit backup must be refreshed. Five core scheduled automations checked enabled and unchanged.


### 19:49 KST checkpoint
- TDD RED: 4 failing / 1 passing page tests reproduced `threads.find is not a function`, thrown backend outage, fabricated sender rendering and unhandled message outage.
- GREEN: 9/9 focused page tests passed; frontend typecheck passed.
- Implementation: bounded envelope validation for owner thread and message arrays, duplicate/sender rejection, distinct unavailable vs verified-empty UI, retry links, no reply/transcript actions on invalid message source. Existing SQL owner scope unchanged.
- Next: full support regression, lint/build/unit/contract/DB/security/CI; keep release HOLD.
