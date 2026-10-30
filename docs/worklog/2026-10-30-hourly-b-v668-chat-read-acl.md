# Backend B v668 — Private Chat Read Least-Privilege Recovery

**Status:** DRAFT / RELEASE HOLD. **Issue:** #2053. **Origin:** main bf8d0d48f810932b43783d8605dce53954c60cff.

## Actual code
- Added forward-only migration 313, four SECURITY DEFINER functions for owner-scoped conversation listing, message history/delta sync, unread total, and participant archive.
- Replaced direct app-role table queries in PostgresChatRepository. Explicit participant checks and bounded limits; canonical bigint cursors remain text across API.
- Added HTTP 403 mapping for DB authorization denial. Missing/unverified unread totals now fail closed rather than reporting zero.
- Preserved chat response shape and existing read-history semantics. No direct grants, financial ledger, WLD, shared database or user data writes.

## Evidence
- RED: repository least-privilege tests 3 failures; service authorization mapping 1 failure.
- GREEN: focused repository/service tests 10/10, chat suite 144 PASS / 8 SKIP.
- Isolated PostgreSQL 17.11: fresh 001 + 312 numbered migrations 002..313 applied; app role denied raw table SELECT/UPDATE; two participants, third-user isolation, message read, unread and archive verified. Isolated container removed.
- Typecheck, backend build, API contract (184 endpoints), database static (62 PASS/4 SKIP), security 13 PASS, targeted lint PASS.
- Full main inherited gates remain failing: backend 126 FAIL, frontend 55 FAIL, whole-tree lint 1 error; exact-SHA official Test and authenticated production-equivalent E2E NOT VERIFIED.

## Deployment decision
No main merge, Test promotion or Production deploy. Production executable/source mismatch #1984 and CI/provenance blockers remain.
