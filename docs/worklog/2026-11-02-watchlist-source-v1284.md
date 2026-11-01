# C v1284 — Verified member stock watchlist and Android owner privacy

## Before work — 2026-11-02T04:46:20+09:00
- Main: a8541927c3a351d980454c66e95a3356c47e0722; independent branch auto/hourly-c-watchlist-source-v1284-20261102-0445; existing main implementation_plan.md change untouched.
- Checked AGENTS.md, README.md, README/README.ko.md, English/Korean PROJECT_PLAN, open PRs/CI, A/B/C/QA worktrees. No current watchlist-source PR found.
- Verified backend GET /api/v1/stocks/watchlist authenticates session and consent, calls public.stock_my_watchlist(actor) (migration 177, owner-scoped SECURITY DEFINER). No new DB grants or WLD writes.
- P1 reproduction target: web watchlist trusts untyped API, BigInt can throw on malformed prices; Android app-api forwards owner watchlist with upstream public cache and no noindex; verified empty and source failure are conflated.
- Plan: RED tests for source parser and Android privacy; GREEN fail-closed validation and private edge; accessible retry and member noindex; run exact-SHA gates. No production changes.

## In progress
- Pending implementation and tests.

## Finished
- Pending.

## In progress — 2026-11-02 04:48 KST
- RED: parser import missing; Android 3 tests failed (public cache and forged success); SSR page threw `Cannot convert bad to a BigInt`.
- GREEN: 19 focused tests pass (3 files). Web now validates SQL-backed rows before BigInt and distinguishes verified empty from unavailable; Android owner GET validates JSON and overrides public cache/index/referrer on success and auth errors.
- Existing authenticated Nest GET and migration 177 owner SQL remain unchanged; no financial writes or direct table grants.
- Re-fetched origin/main mid-task; exact SHA recorded by shell log.

## Finished — 2026-11-02 04:58 KST
- Added route-specific Next.js HTTP privacy overrides for base and locale-prefixed watchlist URLs after confirming the global header would otherwise advertise public indexing. RED test failed; GREEN 20/20 focused tests passed.
- Actual independent Next.js HTTP server (127.0.0.1:31984): `/stocks/watchlist` and `/en/stocks/watchlist` returned HTTP 200 with `x-robots-tag: noindex, nofollow`, `cache-control: private, no-store`, `referrer-policy: no-referrer`. This was an unauthenticated HTTP/header check, NOT a certified logged-in E2E. Local server stopped.
- Lint PASS 0 errors / 1,027 warnings; Typecheck PASS; Frontend Build PASS twice; Backend Build PASS; Frontend full 2,941 PASS; Backend full 2,978 PASS / 2 FAIL / 518 SKIP. Backend failures in unchanged `profile-private-response.http.test.ts` (expected 200, got 401), not fixed here; do not count as PASS.
- App-api contract 184 endpoints PASS; Database package 62 PASS / 5 SKIP; security scripts 17 PASS; QA verifier unit 7 PASS; production-only high-severity dependency audit PASS; full dependency audit FAIL (9: 1 low, 8 moderate); full-route QA FAIL (missing `artifacts/qa/full-route-ledger.json`).
- Isolated PostgreSQL 17.11 (network disabled): 322 migrations PASS, owner watchlist 1 row / other owner 0 rows, exact large WLD price preserved, application role direct SELECT/INSERT on `member_stock_watchlist` denied; container removed. No shared DB mutation.
- Full certified authenticated browser E2E, exact-SHA official Test and independent restore are BLOCKED; remote required CI pending. Do not merge or deploy. Existing production/Test SHA not changed; no rollback needed.
- Mid and pre-final origin/main remained a8541927c3a351d980454c66e95a3356c47e0722. Independent branch/worktree preserved; A/B/Gemini/QA worktrees and all five automations untouched. No branch cleanup because this work is unmerged.
- Final branch HEAD is the last pushed commit; record exact SHA and remote CI status in PR comment after push.
