# C v1296 — Verified Owner Stock Trade History

**State:** BEFORE WORK / DRAFT / RELEASE HOLD. 2026-11-02 12:46 KST.
**Base:** origin/main a8541927c3a351d980454c66e95a3356c47e0722.
**Branch:** auto/hourly-c-stock-history-source-v1296-20261102-1245.
**Read:** AGENTS.md; README.md; docs/planning/PROJECT_PLAN.md and .ko.md; latest Planning v1648 draft; open PRs; A v1225 board order; B v752 central-bank admin session; QA v1460 evidence. README.ko.md is absent on main.

## Scope and proof
- [x] Before work: inspect source and cross-team PR overlap.
- [ ] RED: prove unfiltered malformed trade history is accepted or crashes web/Android.
- [ ] GREEN: validate owner trade rows on both web and Android GET, distinguish empty from unavailable, preserve exact WLD.
- [ ] Check mobile, keyboard, screen reader, SEO and private HTTP headers.
- [ ] Exact HEAD full tests, builds, lint, typecheck, real isolated PostgreSQL, security, app-api, E2E, CI.
- [ ] Re-fetch main and planning; record merge/deploy hold and preserve PR/branch.

## Bounded design
The existing owner-only Nest GET /api/v1/stocks/history reads public.stock_my_trades(actor, limit) from migration 047. The Next page validates only filtered results, so an unfiltered malformed HTTP 200 may crash BigInt rendering or fabricate an empty owner history. The Android gateway likewise validates only minGross requests. Reuse the existing read contract and a single strict shared parser for every GET response. No new endpoint, mutation, SQL grants or WLD movement. Reject malformed rows, duplicate IDs, invalid price/quantity/tax, and invalid timestamps; retain verified-empty. Preserve 50/100/200 window and optional minGross. Fail closed with 503 for Android, accessible unavailable/retry for web. Verify the exact code and HTTP headers, including locale routes.

## In progress
Pending RED tests.

## Finished
Pending gates; no main merge, Test or Production release without every required PASS.
