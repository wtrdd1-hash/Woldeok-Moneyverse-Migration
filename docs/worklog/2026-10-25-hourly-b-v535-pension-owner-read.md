# B v535 — Pension owner-scoped PostgreSQL read boundary

## Before work — 2026-10-25 17:35 KST
- Baseline main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent branch `auto/hourly-b-pension-owner-read-v535-20261025-1735`.
- Debian 13.6 miniPC, root 96% (~4.3 GiB available), data volume 58%; primary services active.
- Read AGENTS, README, English/Korean living plans, QA v1272, open PRs, issue #1302, and A #1303.
- P0 reproduced by QA: `moneyverse_app` direct SELECT on pension account/payout tables raises 42501. This branch addresses member read boundary only; does not certify legacy payouts.
- Coordination: A #1303 annotates historical payouts as UNVERIFIED_LEDGER; do not edit A's branch. Unmerged migration 280 collision across several PRs, B #1293 proposes 281. Reserve unique 282 in this draft; parity remains BLOCKED until 280/281 integrate in order. No applied migration edits.
- Plan: TDD RED repository function call/limit and no direct table SELECT; implement bounded owner-only SECURITY DEFINER account/contribution/payout read functions, no PUBLIC EXECUTE; run isolated PostgreSQL role ACL; execute available unit/typecheck/build/security gates. Do not merge or deploy without all gates and exact-SHA Test.

## In progress
- [x] RED test (backend 4 failed; DB 1 failed before implementation)
- [x] SQL + backend implementation (member account, contribution, payout reads)
- [x] Focused + full verification attempted; known release gates FAIL below
- [x] Mid-run main/plan refresh (main unchanged)
- [ ] Draft PR, CI, final HOLD decision (pending remote push)

## Verification evidence — 2026-10-25 17:45 KST
- TDD: RED backend 4/4 and DB static 1/1, then GREEN backend 4/4 and DB static 1/1.
- Ephemeral network-isolated PostgreSQL 17.11 (not the Production-connected development DB): migration 254 schema + 282 candidate applied; `moneyverse_app` reads only actor-scoped account/contribution/payout rows, unknown actor returns zero, 21-digit WLD numeric preserved, invalid limit rejected; direct table SELECT and payout INSERT denied; outsider EXECUTE denied. Result `PENSION_OWNER_READ_PG_PASS`. Temporary container removed.
- Backend full tests: 1,317 PASS / 398 SKIPPED; typecheck PASS; backend build PASS; root build PASS; root lint PASS (0 errors, 1,128 warnings); API contract 179 endpoints PASS.
- Frontend full tests: 1,397 PASS / 6 FAIL (existing SEO 3, login 1, calculator 1, M2 1). DB package: 15 PASS / 1 FAIL / 3 SKIP; migration parity fails because main ends 279 and this unique draft reserves 282. Existing open PRs compete for 280 and B #1293 uses 281; DO NOT fabricate filler migrations, overwrite other PRs, or deploy out of order.
- Security: production dependency audit FAIL 2 High; full dependency audit FAIL 2 Critical / 10 High. Full authenticated official Test exact-SHA / ledger-finance E2E and independent restore NOT RUN.
- API contract: `GET /api/v1/pension/my-account`, `/my-contributions`, `/my-payouts` keep their paths; existing account/history queries use owner-scoped definer functions. Unknown account now 503 `PENSION_ENROLLMENT_UNAVAILABLE` instead of creating an account during GET. Existing payout rows are historical, not certified ledger settlement; integrate A #1303 UNVERIFIED_LEDGER response before release. No migration applied outside isolated throwaway PostgreSQL, no WLD/ledger writes, no frontend flow certification.
- Auth boundary: NestJS authenticated session supplies actor UUID; PostgreSQL functions filter by supplied actor, but do not independently cryptographically attest that the actor came from a valid session. A compromised application credential can call the function with another actor UUID; this is not a substitute for server authentication. Release review must assess this trust boundary.
- Root disk ~96% used / 4.2 GiB free. No other worker branch/worktree or reservation touched.

## Finished
- **PARTIAL / BLOCKED**: actual Backend and forward-only SQL code implemented and local PG security verified. Migration 280/281 sequencing, frontend failures, security audits, official CI, authenticated Test exact-SHA and GitOps remain blockers. No merge, Test deployment or Production promotion.
