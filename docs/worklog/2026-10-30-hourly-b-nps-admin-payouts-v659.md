# Backend B v659 — Admin pension payout receipt read ACL

## Before work
- [x] miniPC Debian 13.6 status, README, AGENTS, English/Korean planning, QA v1390, open PRs, CI reviewed.
- [x] Remote main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; stack parent v658 `cb025327a67d0c76e17d22dca08f60bc477acea1` (migrations 307–309).
- [x] Scope: `GET /api/v1/admin/pension/recent-payouts` currently queries `national_pension_payout_logs` directly despite 309 revoking app table access. It is admin-guarded but the database read is not scoped to an active admin.
- [x] Do not modify ledger, WLD, existing migrations, Test, Production, other workers or reservations. All release gates HOLD.

## In progress
- [x] RED: 2 failures reproduced (repository SQL and HTTP actor binding), 2 existing assertions passed.
- [x] GREEN: migration 310 with active-admin SQL authorization; controller/service/repository bind session actor; 34 focused tests PASS.
- [x] Isolated PostgreSQL 17.11: active admin, inactive/roleless refusals, PUBLIC/role ACL, ordering, exact numeric, preserved rows PASS.
- [x] Local lint, typecheck, backend/frontend builds, contract 41, database static 58/4 skip, mobile API 183, security 16 PASS. Backend full 2570 PASS / 119 FAIL / 496 SKIP. Frontend full 2607 PASS / 53 FAIL; exact-SHA Test BLOCKED.

## Finished
- [x] Record final branch SHA and PR in external end log after push; remote main unchanged. No merge/deploy; release HOLD.

## Verification checkpoints
- Mid-work `origin/main` remains `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; English/Korean plan hashes unchanged.
- Open dependent Drafts #1987 (307), #1992 (308), #1998 (309); do not merge #1998 or this layer independently.
- QA v1390 independently reports P0 release provenance split, 5 applied-migration checksum mismatches, 119 backend / 53 frontend baseline failures, stale official Test.
- No direct ledger, treasury, audit, WLD, Production, Test, shared DB or service modifications.

## Finished — local verification
- RED 2 expected failures, GREEN 34 focused tests. Isolated PostgreSQL 17.11 PASS; container removed.
- Local gates: lint 0 errors/1,043 warnings; typecheck, backend build, frontend build, contract 41, database 58/4 skipped, API contract 183, security 16, production dependency audit PASS.
- Full Backend: 2,570 PASS / 119 FAIL / 496 SKIP. Full Frontend: 2,607 PASS / 53 FAIL. These failures block integration and cannot be called a release PASS.
- No shared DB migration; no main merge; no Test/Production deploy; no branch cleanup.
