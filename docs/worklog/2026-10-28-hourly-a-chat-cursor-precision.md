# Engineering A — Private chat bigint cursor fidelity (vA-2026.10.28.0025)

Status: **Draft / HOLD; no merge, Test deployment, or Production deployment**.

## Problem and scope

Private chat history and delta-sync accepted `Number.parseInt` prefixes such as `2junk`, rounded valid PostgreSQL `bigint` cursors above `Number.MAX_SAFE_INTEGER`, and used JavaScript `Number`/`Math.max` in the chat room. Read receipts had the same precision hazard. This could skip, duplicate, or incorrectly acknowledge member messages. The generic Android app gateway also trusted upstream cache headers for member chat responses.

This branch preserves exact canonical signed-64-bit decimal strings from chat-room history/sync/read receipts through the Next app API, NestJS controller/service/repository and PostgreSQL `$3::bigint` binding. Malformed, negative, duplicate and out-of-range cursors fail closed (HTTP 400). Zero is allowed for delta sync/read, but not `beforeSequence`. Legacy JSON **safe integer** read receipts remain accepted; unsafe JSON numbers are rejected. The Android chat gateway forces `Cache-Control: private, no-store`, including upstream failures. Existing authenticated conversation-member filters and SQL idempotency are not relaxed; no schema or applied migration is edited.

## Verification and known release blockers

- TDD RED observed 28 backend cursor cases and missing frontend helper; Android gateway privacy tests also failed before the fix. Focused GREEN: backend 87, frontend 26, HTTP read receipts, and PostgreSQL 17.11 synthetic read-only role 5/5 with `9007199254740993`/`9007199254740994` and outsider isolation. Synthetic schema is **not** a full migration or production-role parity test.
- Main at start and mid-check: `004be59307e389a4f293a0a0e71ee4144982936d`. Later main advanced to `4f5efd1f48615f0112701feec25a9b0fc67d9719` (release documentation only). At start 349 remote heads (348 non-main), 339 open PRs, 324 drafts, no duplicate open PR head SHA. Existing PR #1589 and B/C/Gemini work retained.
- Main has two migration `283-*.sql` files, so authoritative migration parity/CI is expected to fail until separately repaired. Migration 220 intended to revoke `moneyverse_app` access to `private_chat_messages`/`private_chat_conversations`, while the repository still reads those tables directly. A **read-only live dev-DB ACL probe at 2026-10-28 00:40 KST** confirmed `moneyverse_app` has **SELECT, INSERT, UPDATE, DELETE** on all three `private_chat_*` tables (explicit `arwdDxtm` grants). Thus the deployed development role is **overprivileged**, not blocked by 42501. A separate least-privilege migration and SECURITY DEFINER read-path repair are mandatory; this branch adds no unsafe GRANT and does not modify DB permissions.
- The independent Test exact-SHA authenticated chat/browser/Android E2E, five-pass route QA, backup restore, full dependency security, and GitOps promotion remain HOLD until authoritative evidence is obtained. No changes to shared DB, balances, deployed services, feature flags, or other workers.

## Rollback

This candidate changes application code only. A reviewed revert restores the previous cursor behavior; no SQL rollback is required. Do not deploy until the separate migration/ACL and release-identity blockers are resolved and re-tested at the exact candidate SHA.

### Gate evidence (before PR)

- Backend unit 1,718 PASS / 431 SKIP; Frontend 1,691 PASS; typecheck PASS; full Next/Nest build PASS; mobile app-api 180 endpoint contract PASS; Bot 8 PASS after installing the isolated worktree's locked dependencies.
- Database suite 32 PASS / 3 SKIP / **1 FAIL** (duplicate migration number 283; missing 285); full project test **FAIL** at the same database gate.
- Full lint **FAIL** with 2 errors in pre-existing `frontend/src/app/blog/blog-data.ts` outside this change; changed-file ESLint 0 errors. Dependency audit at high threshold passed with 2 low / 8 moderate, but Bot audit **FAIL** with 1 critical / 5 high.
- Official Test exact SHA, production release identity, full app-role DB ACL, accessibility/SEO browser E2E, independent restore and GitOps **NOT VERIFIED**. Do not infer a release PASS from focused tests.
