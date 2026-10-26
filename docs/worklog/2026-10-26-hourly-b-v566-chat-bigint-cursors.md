# B v566 — Private chat bigint cursor integrity

## Before work — 2026-10-26 23:44 KST
- Start main: `0fe614b2ca1a7bc0df540514e54db78130479e2a` (fresh fetch); independent branch `auto/hourly-b-chat-bigint-cursor-v566-20261026-2340`.
- P1: chat message sequence is a PostgreSQL bigint returned as text but the API and browser use `Number.parseInt`. Values above 2^53 lose precision, which can skip or duplicate messages and read receipts. Malformed query cursors are also partially parsed.
- Scope: canonical decimal-string cursor validation end-to-end, preserving existing small-integer API clients when safe; SQL remains parameterized and ownership-scoped. No DB/migration/ledger mutation.
- Reviewed AGENTS.md, README, English/Korean project plans, PRs/QA/CI and Superpowers TDD/worktree/verification. Open PRs touching chat media or recipient search do not touch these cursor files.
- Required gates: RED/GREEN, backend/frontend tests, lint/typecheck/build, app-api contract, isolated PG, security audits, GitHub CI, official Test exact-SHA; otherwise Draft/HOLD.

## In progress
- [x] Test RED, then code GREEN, then full verification and review.

## Finished — 2026-10-26 23:55 KST
- Main start/mid/final: `0fe614b2ca1a7bc0df540514e54db78130479e2a` (unchanged after fresh fetch).
- Branch: `auto/hourly-b-chat-bigint-cursor-v566-20261026-2340`; final commit SHA recorded in GitHub PR after push.
- Changed Backend: `chat-sequence.ts`, controller, service and repository. Exact 64-bit sequence strings and legacy safe numeric read receipts; invalid/overflow input returns 400 or repository input error before SQL.
- Changed frontend: browser chat history/delta/read receipts/optimistic sequence use BigInt-safe decimal strings; `actions.ts` sends a string read receipt. No new API path or response field; request DTO accepts decimal string or safe JSON integer.
- DB/migrations/permissions/ledger/WLD: unchanged. Isolated PostgreSQL 17.11 bigint and synthetic read-only ACL PASS; full project migration/app-role integration not certified.
- RED: 9 focused failures; GREEN: Backend focused 18/18, frontend focused 3/3. Full pnpm test PASS on committed candidate (contract 38, DB 15/3 skipped, Backend 1338/398 skipped, Frontend 1426). Typecheck, lint (0 errors / 1131 warnings), full build, app-api contract PASS. Production audit PASS; full audit FAIL (2 Critical, 8 High), bot audit FAIL (1 Critical, 5 High).
- Official Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production `6a989b5ac0c6155587d43426d64f6def6b62c917`: both not candidate SHA. Exact-SHA authenticated Test E2E/real project PG ACL and GitOps gate BLOCKED; Production HOLD.
- No main merge, deployment, service restart, shared DB writes, or branch/worktree cleanup. A/C/QA/Gemini worktrees and five core automation settings unchanged.


### Mid-work checkpoint — 2026-10-26 23:51 KST
- RED: 9 focused failures reproduced on unmodified code (precision loss, partial `parseInt`, unsafe numeric read receipt). GREEN: targeted backend 16/16 and frontend 3/3 after changes.
- Typecheck PASS, ESLint PASS (0 errors, 1,131 existing warnings), full pnpm test PASS (backend 1,336 PASS / 398 SKIP; frontend 1,426 PASS), full build PASS.
- Isolated networkless PostgreSQL 17.11 synthetic bigint boundary and read-only ACL negative check PASS; no Production/dev shared DB access or mutations.
- Production dependency audit PASS; full pnpm audit FAIL (2 critical, 8 high, 11 moderate, 3 low); bot npm audit FAIL (1 critical, 5 high).
- Full CI and official Test exact-SHA authenticated flows remain unverified, so Draft/HOLD. Existing QA/A/C/Gemini branches untouched.

### Final candidate verification checkpoint
- Commit `a90c8f10f3450b383a85fbb9570fd52afd3bc89d`: exact-SHA full `pnpm test` PASS (Backend 1,338/398 skipped, Frontend 1,426; DB 15/3 skipped; contract 38), full `pnpm build` PASS. CI classify/policy PASS; runtime jobs pending at last inspection.
- Worklog correction: 1,336 was the earlier pre-final focused-test count; 1,338 is the final suite count after two extra cursor negative/positive tests.
