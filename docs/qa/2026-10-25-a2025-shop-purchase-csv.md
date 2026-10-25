# Development A2025 QA — Private Shop Purchase CSV Export

**Date:** 2026-10-25 KST. **Branch:** `auto/hourly-a-shop-purchase-export-20261025-2025`. **Baseline main:** `1c5b84a1c45baafcca83f375a6f99698121e9bb5`. **Code SHA:** `f869bad1e6f0f577dd3f3bf7ad8e9e14574a1ab2`. **Disposition:** PARTIAL / BLOCKED / RELEASE HOLD.

## Implemented end-to-end path
- Signed-in `/shop` CTA downloads only the member's most recent 1..100 purchases as UTF-8 CSV from `/api/shop/purchases/export`; default 100. The BFF calls NestJS `GET /api/v1/shop/purchases?limit=N`, which preserves Session/Authenticated/Consent guards and derives the actor exclusively from the session. Existing callers retain default 30.
- Existing PostgreSQL `public.shop_list_my_purchases(actor_uuid, limit)` SECURITY DEFINER function provides purchase/item IDs, item name, exact WLD decimal string, transaction reference and timestamp. Android `/app-api/v1/shop/purchases?limit=100` preserves member cookie, query and private/no-store response. No migration or ledger write.
- Private/no-store/noindex/nosniff attachment; formula-leading item names are neutralized after removing control/format characters. Rejects malformed UUID, amount outside positive bigint, timestamp, upstream list/size and backend errors (503, never fake empty). WLD >2^53 is retained as text. Transaction reference is not independent proof of settlement; CSV is bounded recent history, not complete archive.

## Tests and blockers
- TDD RED: backend 12 failing assertions before strict limit; frontend route absent. GREEN: backend focused **12 PASS**, CSV route **14 PASS**, Android gateway suite **12 PASS** (2 new). Early BOM/CRLF mismatch corrected; Unicode format and bigint boundary tests added.
- Initial full run at `817f25869c3c48abad82269e362e002dce321533`: Typecheck PASS; Lint PASS (0 errors / 1,128 warnings); Backend/Frontend Build PASS; mobile contract 179 endpoints PASS; contract 38 PASS; database package 15 PASS / 3 SKIPPED; backend **1,325 PASS / 398 SKIPPED**; frontend **1,411 PASS / 6 FAIL**. Six failures: SEO/i18n 3, login touch 1, calculator registration 1, admin M2 1. Separate QA #1317 owns overlapping regressions; no edits to it. Final SHA recheck required.
- Security audits FAIL: production High 2; all Critical 2 / High 10 / Moderate 11 / Low 3; bot Critical 1 / High 5.
- Real isolated PostgreSQL 17 (`moneyverse-test-db` / `wdmv_v761_test_acl`, 281 migrations): `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app`; purchase function EXECUTE true; direct purchases SELECT false; ledger INSERT false; owner queries for limits 30 and 100 succeed; **0 purchases**; `ROLLBACK`. No seeded fixture or positive authenticated purchase E2E. Production-linked 5433 untouched.

## Branch audit, deployment and rollback
- Start 184 remote heads / 180 open PRs. After branch push 185 heads, 184 non-main all ahead of main, no duplicate final tree or tip patch ID. 3 conflicting PRs (#1143, #1110, #1107), 136 existing PRs with failed check rollups. Zero branch deletion, all unique unmerged changes protected.
- Start/mid/pre-integration main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; English canonical and Korean planning pairs rechecked. Official Test health HTTP 200 but Test SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production SHA `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither equals candidate.
- **Exact-SHA official Test authenticated purchase flow BLOCKED**. **NO MAIN MERGE / NO OFFICIAL TEST PROMOTION / NO PRODUCTION DEPLOY / NO DB WRITE / NO SERVICE RESTART / NO GITOPS.** Rollback before release: withdraw unmerged Draft PR. After a future release, rollback requires a reviewed revert and wallet/ledger verification, not silent reactivation.

**Conclusion:** Code-level P1 implemented; release PARTIAL / BLOCKED until complete CI/security and positive Test exact-SHA authenticated finance E2E. Final SHA and CI evidence in PR record.
