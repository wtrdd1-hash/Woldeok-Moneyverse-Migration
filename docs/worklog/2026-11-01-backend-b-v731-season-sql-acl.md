# Backend B v731 — season settlement SQL EXECUTE lockdown

**State:** FINISHED / PARTIAL / RELEASE HOLD — 2026-11-01 21:24 KST.
**Priority:** P0, issue #2357; dependent HTTP hold PR #2358.
**Start, mid-work, final fetched main SHA:** `3d5e321c3d1221febff677469fecdfcb3cf42e7d`.
**Branch:** `auto/hourly-b-v731-season-db-acl-20261101-2106`; initial code SHA `2c6e93f7221f6b4c1a13a494635be39cee48b09e`.
**PR:** #2376, Draft / hold.
**Environment:** miniPC Debian 13.6; Backend/Frontend/Nginx/Docker active. No shared DB writes.
**Reviewed:** AGENTS.md, README.md, PROJECT_PLAN.md and PROJECT_PLAN.ko.md (English authority, Korean parity), QA v1445, current A/C/QA/Planning PRs, main CI, P0 #2357. Main contains migrations through 320; no inspected open PR adds migration 321. Recheck numbering before any integration.

## Before work
- [x] Confirm SQL function `public.season_settle_rewards(uuid)` defined in migrations 231/265 and granted to `moneyverse_app` by 265.
- [x] Confirm API hold in Draft PR #2358 does not revoke DB execution; app role remains a SQL attack path.
- [x] Choose minimal forward-only migration. No financial data, function body, applied migration or shared DB changes.

## In progress — actual code and TDD
- [x] RED: source contract 2 tests fail before migration 321 exists (exit 1).
- [x] RED: isolated PostgreSQL 17.11 applied 319 numbered migrations (002–320); app EXECUTE was still granted (exit 3). Container auto-removed.
- [x] Migration 321 revokes `EXECUTE` from PUBLIC and `moneyverse_app` on the existing settlement function only.
- [x] GREEN: source contract 2/2 PASS.
- [x] GREEN: isolated PostgreSQL 17.11 applied 320 numbered migrations (002–321); app EXECUTE=false, PUBLIC EXECUTE=false, migrator owner retained, SECURITY DEFINER unchanged, direct app invocation denied. Container auto-removed.
- [x] Mid/final origin/main and both planning files unchanged; no main rebase needed.
- [x] Draft/HOLD PR #2376 opened; P0 #2357 updated with migration 321 coordination.

## Verification
| Gate | Result |
| --- | --- |
| Database package | 64 PASS / 4 SKIP |
| Contract package | 41 PASS |
| Mobile app API contract | 184 endpoints match |
| Backend season focused | 9 PASS |
| Security/release focused | 14 PASS |
| Root test preliminary security | 34 PASS |
| Root lint | PASS (0 errors, 1027 warnings) |
| Root typecheck | PASS |
| Root build, including frontend | PASS |
| Fresh isolated PostgreSQL 17.11 | 320 numbered migrations PASS; negative SQL ACL PASS |
| Root `pnpm test` | FAIL: Backend 2968 PASS / 2 FAIL / 518 SKIP; profile HTTP fixture expects 200 but receives 401 |
| Standalone frontend full suite | TIMEOUT after 170 seconds; no complete pass result |
| Production dependency audit | PASS: no known vulnerabilities |
| Full dependency audit (high threshold) | 9 findings (1 low, 8 moderate); command exit 0, findings not cleared |
| Official Test exact-SHA public gate | FAIL: backend_version_unverified, frontend_version_unverified |
| Host Test identity gate | BLOCKED: EACCES on protected Test backend env file |
| Authenticated Test E2E / independent restore | NOT RUN: exact-SHA and required gates blocked |
| Remote CI | Classify, policy, release-input, runtime-check, verify/classify, verify/policy, verify/runtime-check PASS; build pending at last check |

## API/DB contract and remaining P0 work
No HTTP route, DTO or payload change in this PR. Existing season-settlement HTTP hold #2358 remains Draft. Function body, owner, signature and settlement rows remain unchanged; the web application role cannot invoke the privileged function after applying migration 321. The migrator owner retains execution, so this does **not** establish safe operator settlement or enforce season-end, idempotency, audit and ledger receipts. P0 #2357 remains open.

## Finished — release decision
**PARTIAL / BLOCKED / RELEASE HOLD.** The SQL authorization subfix has real code and focused/isolated PG verification, but full test and official Test gates are not green. No main merge, Test candidate deployment, Production promotion, DB/ledger/WLD mutation or unrelated branch cleanup. Only this worktree's generated `frontend/.build_id` was removed; all other agent branches and automation schedules remain untouched.
