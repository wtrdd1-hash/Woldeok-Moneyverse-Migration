# C v1295 — Verified virtual-stock comparison source

## Before work (2026-11-02 12:15 KST)
- Base: `a8541927c3a351d980454c66e95a3356c47e0722` (`origin/main`); separate `auto/hourly-c-stock-compare-source-v1295-20261102-1215` worktree.
- Reviewed AGENTS.md, README.md, README/README.ko.md, both integrated plans, open PRs, A/B/C/QA work and GitHub CI. No active PR directly modifies the stock comparison route. Existing market API is NestJS `/api/v1/stocks` backed by PostgreSQL `stock_market_overview()`.
- P1 defect: `/stocks/compare` treats any truthy `{ stocks: ... }` as a valid list and forwards unvalidated integer fields to `BigInt`; a malformed response can crash the page, or show unverified data. Do not confuse failure with a verified empty market.
- Scope: fail-closed response verification, exact integer-string preservation, accessible retry, mobile overflow handling, tests. No DB or financial mutations.
- Plan: (1) failing boundary tests; (2) response validation; (3) page error/retry and responsive table; (4) HEAD verification and review; (5) draft PR and release gate disposition.
- Status: IN PROGRESS. No release or merge authorized until all gates PASS.

## In progress (2026-11-02 12:18 KST)
- TDD: baseline permissive parser reproduced 5 failed tests / 1 pass; implemented strict UUID/symbol/name/integer/range/duplicate checks and verified 6/6 source tests.
- Server page now distinguishes invalid/unavailable source from a verified empty market; offers accessible retry. Comparison table has keyboard-focusable horizontal scroll and mobile word breaks.
- Server-rendered integration: 3/3 tests passed; combined focused tests 20/20 passed. Whole-workspace typecheck passed; lint emitted 0 errors and 1,027 existing warnings.
- Midpoint `git fetch origin main`: unchanged at `a8541927c3a351d980454c66e95a3356c47e0722`. Production/Test untouched.
- Next: full exact-HEAD gates and CI. No gate has been waived.

## Finished
- Pending.
