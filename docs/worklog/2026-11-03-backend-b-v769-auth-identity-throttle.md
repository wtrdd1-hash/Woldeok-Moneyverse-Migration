# Backend B v769 — Identity mutation throttle parity

## Before work — 2026-11-03 04:38 KST
- Base `origin/main` `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; isolated worktree, no shared checkout edits.
- QA v1480 P0 HOLD; root 96% used / 4.5 GiB free after A's independently verified safe cache reclaim. No shared cleanup or DB writes.
- Initially reproduced the existing two production-mode profile fixture failures (2 FAIL / 6 PASS), but abandoned that task because A's Draft #2265 already fixes it. Do not duplicate.
- New distinct P1 source discrepancy: `POST /api/v1/account/identities/:provider/link` creates an OAuth challenge and `DELETE /api/v1/account/identities/:id` removes a login method, yet `tierFor` currently applies the generic 60/min sensitive tier instead of the 20/min auth tier. Keep unrelated account mutations unchanged.

## In progress
- [x] RED: regression assertions for both real identity mutation routes and non-matching account paths.
- [x] GREEN: narrowly classify only POST link and DELETE unlink as auth-tier.
- [x] Run focused and broader backend tests, typecheck, lint, build; inspect current main and required CI.

## Finished — 2026-11-03 04:57 KST
- Backend-only behavior: POST identity link and DELETE identity unlink now use the existing 20/min auth tier instead of 60/min sensitive tier. Unrelated routes retain their previous budgets; no endpoint, body, schema, migration, ledger, WLD or user data change.
- TDD: 1 RED / 29 PASS before implementation; 35/35 focused security and throttler tests GREEN.
- Backend `NODE_ENV=test`: 2,987 PASS / 518 SKIP. Backend typecheck and build PASS.
- Backend `NODE_ENV=production` full suite TIMEOUT at 115s, not PASS. Production-mode focused 41 PASS / 2 FAIL; the two existing `profile-private-response.http.test.ts` 401-vs-200 failures are already owned by Draft #2265 and were reproduced independently before this change.
- Frontend full 2,947 PASS; database package 72 PASS / 5 SKIP; frontend typecheck and Webpack build PASS; root lint 0 errors / 1,027 existing warnings; contract 184 endpoints / 684 methods PASS.
- No real PostgreSQL authenticated integration, official Test exact-SHA E2E, independent restore or GitOps gate was run; all remain BLOCKED. Release HOLD; do not merge or deploy.
- Host root disk 97% (~3.7 GiB free) after builds; other agents' caches, branches, Docker volumes and backups untouched.
- Rechecked origin/main before commit and PR; branch was created from current main and is isolated from the dirty security audit checkout.

