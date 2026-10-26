# Chat bigint cursor integrity — implementation plan

> **For agentic workers:** Required methodology: isolated worktree, RED/GREEN, independent review, verification-before-completion.

**Goal:** Prevent precision loss and malformed cursor coercion in private-chat pagination, delta sync, and read receipts.

**Architecture:** PostgreSQL `bigint` sequence values remain canonical decimal strings through NestJS, repository query parameters and Next.js browser actions. The browser uses `BigInt` only for comparison and optimistic display, never `Number.parseInt`. Legacy safe JSON integer read receipts remain accepted. This does not change SQL schema, member authorization or balances.

**Spec:** Existing `backend/src/chat/chat.controller.ts`, `chat.repository.ts` and `frontend/src/app/chat/chat-room.tsx`; AGENTS.md bigint guidance.

## Global constraints
- Do not change applied migrations, grants, authentication guards, WLD or member data.
- Reject negative, noncanonical, overflowing and unsafe numeric cursors before querying.
- Keep API paths and response shape unchanged; read receipt request accepts canonical string or safe integer.
- All development is isolated; no shared Production-connected DB writes.

## Review focus
- `9007199254740993` must survive both before/since cursors and read receipt exactly.
- `12junk`, `0003`, negative, float, exponential and `9223372036854775808` must fail closed.
- `0` and `9223372036854775807` must be handled correctly.
- Old safe JSON numeric read receipt must still work.
- Ownership-scoped parameterized SQL and authenticated browser gateway remain unchanged.

## Task 1 — API/repository contract
- [x] Add RED tests for loss of precision and malformed query cursors.
- [x] Add a canonical sequence validator, use it in controller and repository.
- [x] Change service/repository sequence argument types to accept canonical string and legacy safe integer.
- [x] GREEN targeted backend tests.

## Task 2 — Browser parity
- [x] Add bigint-safe frontend sequence helper and tests.
- [x] Remove `Number.parseInt` sequence handling from private chat room and read action.
- [x] GREEN frontend focused tests.

## Task 3 — Evidence and release HOLD
- [x] Run typecheck, lint, full tests, full build, app-api contract, isolated PostgreSQL bigint/ACL check and audits.
- [ ] Wait for full required GitHub CI and official isolated Test exact-SHA authenticated E2E before merge.
- [ ] Recheck main and planning before any merge, then post-merge exact main SHA Test/GitOps gates before Production.
