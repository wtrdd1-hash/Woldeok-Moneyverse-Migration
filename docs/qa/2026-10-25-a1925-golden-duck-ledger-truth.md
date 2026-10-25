# Development A1925 QA — Golden Duck ledger truth and non-financial practice

**Date:** 2026-10-25 KST. **Branch:** `auto/hourly-a-golden-duck-practice-20261025-1925`. **Baseline main:** `1c5b84a1c45baafcca83f375a6f99698121e9bb5`. **Initial implementation commit:** `f0353d7f2d4cc6c0b116e09c8c5bac9c2701a5db`. **Release:** DRAFT / PARTIAL / HOLD.

## Problem, security boundary, and actual changes
- Old Golden Duck POST accepted browser-supplied tap counts and checked daily eligibility separately from `economy_post_transaction`, allowing racing independent idempotency keys; null DB provider fabricated a success receipt. The web score was labeled as deposited WLD before any verified transaction. No actual Production exploitation is asserted.
- The public reward POST now always rejects 503 (`golden_duck_settlement_unavailable`); the repository's old mint entrypoint also refuses before querying PostgreSQL. No code in this change posts WLD, adjusts balances or creates inventory.
- New authenticated/consent-protected GET `/api/v1/engagement/dopamine/golden-duck/status` checks only a **member's own** KST-today committed ledger transaction **with a matching cash credit posting and owner account**, returns `claimedToday`, `transactionId|null`, and `rewardClaimsEnabled:false`. Missing repository/DB errors return 503 rather than a fake empty history. Response is `private, no-store`; no direct table DML.
- Next.js server action consumes this owner-scoped read. The existing 10-second Golden Duck UI remains keyboard-operable, but displays **local practice points only**, explicit **no WLD payout**, and verified/unknown ledger states. It sends no claim request or wallet update event. Android app-api proxies owner cookie/CSRF and preserves 503 and no-store.

## TDD and test evidence (source tree, before final documentation SHA)
- RED: 6 backend failures and 5 frontend failures before code; further repository direct-mint negative test failed RED. GREEN: focused backend 17/17, frontend+Android gateway 23/23, repository direct-mint 3/3; Typecheck PASS; lint PASS with 0 errors and 1,128 pre-existing warnings; backend and frontend build PASS.
- Workspace full `pnpm test`: security/release guards and contract PASS; contract 38 PASS; database 15 PASS / 3 SKIPPED; backend **1,318 PASS / 398 SKIPPED**; frontend **1,402 PASS / 6 FAIL** (3 SEO/i18n, 1 login touch target, 1 calculator register link, 1 admin M2 telemetry). QA #1317 owns overlapping regressions; no edits to its branch.
- Android app-api schema contract generation/check PASS, 179 endpoints; focused gateway 12 PASS. Discord bot after isolated `npm ci --ignore-scripts`: 8 PASS.
- Security audits FAIL: production **2 High**; full **2 Critical / 10 High / 11 Moderate / 3 Low**; bot **1 Critical / 5 High**. These are release blockers, not waived.
- Real isolated PostgreSQL 17 `moneyverse-test-db` / `wdmv_v761_test_acl`, transaction `BEGIN READ ONLY`, `SET LOCAL ROLE moneyverse_app`: SELECT on `ledger_transactions`, `ledger_postings`, `accounts` allowed; ledger INSERT denied; dummy-owner KST credit query 0; `ROLLBACK`. No seeded reward, no mutation, no authenticated positive-receipt E2E. Production-linked 5433 untouched.

## Integration / deployment / rollback
- Remote main rechecked at start and midpoint, same SHA; English `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md` and Korean plan companions read. Unmerged B/C/Gemini/QA changes untouched.
- Start: 179 remote branches including main, 175 open PRs. Existing conflicting #1143/#1110/#1107 protected. Zero remote branch deletions. Final branch/PR counts and exact head SHA to be recorded in PR evidence after push.
- **Official Test exact-SHA authenticated web+Android+finance E2E: BLOCKED.** Public Test is not running this SHA; positive owner cash-credit fixture not present. **Production: NO DEPLOY, NO DB WRITE, NO SERVICE RESTART, NO GITOPS, NO MAIN MERGE.**
- Feature is fail-closed: POST 503 and practice-only UI. Rollback is to revert the unmerged branch only; if eventually deployed, reverting would restore the unsafe mint path, so **do not rollback to the vulnerable version without an independently approved safe hold**. Follow-up P0 issue #1319 tracks migration-owned atomic daily claim, idempotency, concurrency, and exact-SHA acceptance.

**QA result:** PARTIAL / BLOCKED. Code-level safety improvement and read-only status implemented; financial reward feature remains intentionally disabled. No success claimed for financial settlement or release.
