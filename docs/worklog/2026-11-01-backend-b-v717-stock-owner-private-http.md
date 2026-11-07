# Development B v717 — stock owner HTTP privacy

## Before work — 2026-11-01 11:03 KST
- Debian 13.6 miniPC, services active, `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`.
- Read AGENTS.md, README, English/Korean PROJECT_PLAN, QA v1434, open PR/branches, and CI; protected A/C/Gemini/QA/planning worktrees.
- P1 defect: actor-only stock watchlist, holdings, trade history, settlement receipts, and order responses lacked pre-auth cache/crawler/referrer protection. This is not evidence of actual data exfiltration.
- Design: controller-bound Nest middleware plus actual Next app-api gateway owner policy, fail-closed on owner paths, explicitly allowlisted public GET/HEAD market data. No API payload, DB schema, migration, WLD, or ledger changes.

## In progress — 2026-11-01 11:03–11:19 KST
- TDD RED: 7/11 real HTTP tests failed on missing owner headers, four public controls passed. A route-string middleware attempt did not attach under URI versioning; corrected to controller-bound middleware.
- GREEN: 12/12 HTTP tests PASS, including 200, 201, 401, 403, HEAD and five public market GETs; stock-focused regression 195 PASS/11 SKIP before final 12th test.
- Midpoint `origin/main` and EN/KO plans refreshed; SHA unchanged. Branch isolation maintained.
- Full lint PASS (0 errors, 1022 existing warnings), typecheck PASS, full build PASS (exit 0), contract 41 PASS, mobile API 184 PASS, DB package 62 PASS/4 SKIP, security/release/backup policy 34 PASS.
- Full Backend first attempt under inherited `NODE_ENV=production`: 2960 PASS/2 FAIL/517 SKIP (profile HTTP fixture). Reproduced production-mode fixture mismatch; with `NODE_ENV=test`, complete suite 2962 PASS/517 SKIP (0 failures in log). Focused profile 8/8 PASS in test mode.
- Full Frontend first attempt under inherited production-mode React.act: 2371 PASS/497 FAIL (environment artifact). With `NODE_ENV=test`: 2899 PASS/2 FAIL, known expired admin console fixtures #2292; **not a PASS**.
- Isolated PostgreSQL 17.11: 316 migrations applied; app direct balance UPDATE, ledger DELETE and users SELECT denied; stock DB tests 1 PASS/3 SKIP; isolated container removed. Shared Test/Production DB untouched.
- Production-only dependency audit 0 known vulnerabilities PASS; full audit FAIL (1 low, 8 moderate).
- Remote PR #2302 code-SHA CI classify/policy/release-input PASS; runtime-check FAIL due the same two known #2292 frontend fixtures; build and promotion skipped. This is not a release approval.

## In progress — 2026-11-01 11:22–11:24 KST
- Source review found Next app-api only forwarded upstream cache-control and did not forward X-Robots-Tag/Referrer-Policy for stock owner paths other than history; backend-only fix would not protect the browser/Android gateway. Scope extended to the same owner privacy issue at the real app-api boundary.
- Gateway RED: 5 owner tests failed/6 passed with malicious public upstream headers; GREEN: 11/11 PASS. Combined gateway/history regression 14 PASS, changed frontend ESLint PASS and full typecheck PASS.
- `frontend/src/app/app-api/v1/[...path]/route.ts` now forces private no-store/noindex/no-referrer for watchlist, portfolio, history, halt receipts, watchlist mutations and order receipts, including upstream error responses. Public stock price/candle/market data remains unmodified.

## Finished — 2026-11-01 11:24 KST
- Changed `backend/src/stock/stock.module.ts` and `frontend/src/app/app-api/v1/[...path]/route.ts`; added Nest HTTP and app-api gateway regression tests; no new route or schema contract.
- Branch `auto/hourly-b-v717-stock-owner-private-http-20261101-1100`; Draft/HOLD PR #2302; backend checkpoint `8bcfe36218dbbbb02a9be3a51ae4f8f4548d0c09`, worklog checkpoint `c214c0799b38ed1adffa576089a164a55f55916f`.
- Official Test exact-SHA (public backend/frontend version mismatches and host identity ReferenceError), authenticated user E2E, independent restore, Production DB finance/ACL and GitOps approval remain **BLOCKED**. No main merge, Test deployment, Production promotion, WLD movement, shared DB mutation, service restart, or branch cleanup.
- Final status: PARTIAL / BLOCKED — real Backend change complete locally; full release gates not passed; RELEASE HOLD remains.
