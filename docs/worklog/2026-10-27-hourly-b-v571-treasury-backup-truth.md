# Backend B v571 — Treasury backup evidence fail-closed

## BEFORE (2026-10-27 04:36 KST)
- Base `origin/main`: `0fe614b2ca1a7bc0df540514e54db78130479e2a`.
- Task: P1 security/recovery integrity. `TreasuryRepository.createImmutableBackupSnapshot` computes a local hash and reports an immutable cloud backup without persisting or verifying an artifact; `getBackupStatus` reports 54 verified snapshots and quota from constants. No proof of real backups. This is independent of C's frontend money-flow/treasury changes and B's migration 280 work.
- Invariants: no Production/Test/DB mutation, no fake backup success, preserve route and guards, no migration or WLD changes. Other branches and automations untouched.
- Checklist: [x] read main/docs/PRs/QA; [ ] RED tests; [ ] safe backend fix; [ ] focused/full verification; [ ] independent CI; [ ] Test exact SHA (blocked until gates); [ ] final log.

## IN PROGRESS
- Planned HTTP contract: both `POST /api/v1/admin/treasury/backup/snapshot` and `GET /api/v1/admin/treasury/backup/status` must return 503 `TREASURY_BACKUP_EVIDENCE_UNAVAILABLE` until durable, verified storage and restore evidence are implemented. Direct repository callers must also fail closed. Existing `admin/backups` path is distinct and not modified.

### TDD checkpoint (04:37 KST)
- RED: 4/4 new tests failed against main; fabricated snapshot/status and service pass-through reproduced.
- GREEN candidate: removed fabricated repository snapshot/status and made both service methods reject with structured HTTP 503 before repository invocation. Existing API routes and admin guards remain unchanged.
- Focused GREEN: 22/22 (4 new boundary tests + 18 existing service tests). Prior test asserting fabricated success replaced with fail-closed contract. No DB operations in new boundary tests.
- Midpoint main and both planning documents rechecked; main remains `0fe614b2ca1a7bc0df540514e54db78130479e2a`.

### Validation checkpoint (04:43 KST)
- P1 tracking issue: #1486.
- Focused Vitest 22/22 PASS. Isolated disposable PostgreSQL 17.11 test 1/1 PASS, container removed; this verifies refusal with a real PG pool and unchanged synthetic table, **not** a real provider backup or restore.
- Full `pnpm typecheck` PASS, `pnpm lint` PASS (0 errors / 1,131 warnings), `pnpm test` PASS (backend 1,330 PASS / 398 SKIPPED before the new opt-in PG test; frontend 1,423 PASS), `pnpm build` PASS.
- Bot test initially failed due to absent optional `bot/node_modules` in new worktree, not a code defect. After isolated `npm --prefix bot ci --ignore-scripts`, bot tests 8/8 PASS.
- Production-only pnpm audit PASS (0 known); full pnpm audit FAIL (2 Critical / 8 High / 11 Moderate / 3 Low); bot audit FAIL (1 Critical / 5 High). Mandatory security gate BLOCKED.
- Official Test exact-SHA, authenticated admin backup flow, independently verified provider upload and restore, release approval: BLOCKED. No Production/Test promotion.
