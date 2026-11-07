# C v1296 — Verified Owner Stock Trade History

**State:** FINISHED — PARTIAL / DRAFT / RELEASE HOLD. 2026-11-02 12:46 KST.
**Base:** origin/main a8541927c3a351d980454c66e95a3356c47e0722.
**Branch:** auto/hourly-c-stock-history-source-v1296-20261102-1245.
**Read:** AGENTS.md; README.md; docs/planning/PROJECT_PLAN.md and .ko.md; latest Planning v1648 draft; open PRs; A v1225 board order; B v752 central-bank admin session; QA v1460 evidence. README.ko.md is absent on main.

## Scope and proof
- [x] Before work: inspect source and cross-team PR overlap.
- [x] RED: prove unfiltered malformed trade history is accepted or crashes web/Android.
- [x] GREEN: validate owner trade rows on both web and Android GET, distinguish empty from unavailable, preserve exact WLD.
- [x] Check mobile, keyboard, screen reader, SEO and private HTTP headers (unit + real HTTP headers; actual device E2E BLOCKED).
- [x] Execute full candidate gates; failures and unexecuted exact-SHA E2E are recorded, NOT PASS.
- [x] Re-fetch main and planning; record merge/deploy hold and preserve PR/branch.

## Bounded design
The existing owner-only Nest GET /api/v1/stocks/history reads public.stock_my_trades(actor, limit) from migration 047. The Next page validates only filtered results, so an unfiltered malformed HTTP 200 may crash BigInt rendering or fabricate an empty owner history. The Android gateway likewise validates only minGross requests. Reuse the existing read contract and a single strict shared parser for every GET response. No new endpoint, mutation, SQL grants or WLD movement. Reject malformed rows, duplicate IDs, invalid price/quantity/tax, and invalid timestamps; retain verified-empty. Preserve 50/100/200 window and optional minGross. Fail closed with 503 for Android, accessible unavailable/retry for web. Verify the exact code and HTTP headers, including locale routes.

## In progress
Pending RED tests.

## Finished — 2026-11-02 13:00 KST, PARTIAL / RELEASE BLOCKED
- Draft PR #2472, independent worktree and branch retained. Baseline a8541927c3a351d980454c66e95a3356c47e0722 unchanged at start, midpoint and pre-finish; planning v1648 remains unmerged Draft/HOLD. A/B/Gemini/QA worktrees, branches and reservations untouched.
- RED: six original tests fail on baseline, plus one HTTP indexing policy test. GREEN: 31 focused tests and HTTP policy test pass.
- Candidate code SHA d4eedfde8114c3a5ccaa11166934bc49793d6bec: pnpm build PASS; typecheck PASS; lint PASS (0 errors, 1027 warnings); frontend 2929 PASS; backend 2978 PASS, 2 FAIL, 518 SKIP; database 62 PASS, 5 SKIP; contract PASS; app-api 184 endpoints PASS; bot 11 PASS after linking existing local bot dependencies. The initial bot test failed due to missing worktree node_modules, not source code.
- The same two profile privacy HTTP tests fail with 401 instead of expected 200 on unmodified main; this is not a release waiver. Root pnpm test FAIL from backend suite.
- Isolated PostgreSQL 17.11: 322/322 migrations PASS; 56 DB/stock integration tests PASS; stock_my_trades EXECUTE=true, virtual_stock_trades direct SELECT=false and INSERT=false; unknown actor reads zero rows. First migration attempt failed because container lacked read-only SQL volume; corrected isolation harness and reran successfully. Container and temporary password file removed. No shared DEV/Production DB changes.
- HTTP header probe from independent Next.js runtime: /stocks/history and /en/stocks/history both return private no-store, noindex nofollow and no-referrer with SEO_INDEXING_ENABLED=true. This is a header-only probe; without authenticated Test credentials it does not establish a valid member E2E. UI tests prove error/retry and 44px keyboard button; real mobile/200% zoom/screen-reader device measurements BLOCKED.
- Production dependency audit High+ PASS; full audit FAIL: 9 advisories (8 moderate, 1 low). Full-route QA FAIL: artifacts/qa/full-route-ledger.json missing. Official authenticated E2E and candidate Test exact-SHA BLOCKED. Read-only sudo Test identity preflight FAIL: official Test and Production frontend/API version 510dbe6bf4d5c2a8089fc06b480776053da7a2e3, not candidate; six SHA mismatches. Treasury public status 200 also observed; do not treat it as certified.
- Remote PR CI at last mid-check: classify/policy/release-input PASS, runtime-check pending; no full CI PASS claim. Final CI status recorded in PR comment when available.
- **No main merge, official Test staging, Production deployment, GitOps change, rollback or branch deletion.** Release gate not met. Candidate retained for remediation and later exact-SHA verification. All five scheduled automations remain untouched.


### 12:49 KST — IN PROGRESS / RED→GREEN
- RED: 6 tests failed on main-derived HEAD, including `history?.trades.filter is not a function` and Android unfiltered HTTP 200 instead of required 503. Evidence `evidence/red.log` in miniPC task directory.
- GREEN: 31 focused tests PASS, frontend TypeScript PASS, contract build PASS. A single strict parser now validates every owner trade GET, with private Android error behavior and accessible web retry. No backend, SQL, financial or permission changes.
- Midpoint fetch: origin/main still a8541927c3a351d980454c66e95a3356c47e0722; planning v1648 remains Draft/HOLD. No overlap with A board, B central-bank or QA.
- Full SHA gates, real PostgreSQL, security audit, CI and exact-SHA Test remain pending; release HOLD.
