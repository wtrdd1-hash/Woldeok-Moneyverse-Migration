# 2026-09-14 — Stock detail hub v2026.09.14.75

## Baseline and overlap review

- Started from `origin/main` `2bb84e2b1272ee40c373aa9bd8ee89ab08b286ea`.
- Reviewed the only remote non-main application branch `feature/app-auth-simplify-v2026.09.13.48`; it is auth-only and does not overlap the stock hub.
- Confirmed older Economy Scenario Lab, Event Calendar, Business Settlement Boost, Trusted Client IP, Admin edit-state, Stock-tagged Community, Stock Comparison, Conditional Alerts, Account Security Center, Personal Dashboard and Portfolio Analysis work is already represented on main.
- Mid-work, main advanced to `40e1e504241d5769c9674cd821bda651e5f3ad22` with documentation-only growth planning; rebased before validation with no stock-file overlap.

## Runtime change

- Added `/stocks/[symbol]` as the first canonical member-facing virtual-stock detail hub.
- The hub combines current price/day range/supply, watchlist state, authoritative caller holdings, existing candlestick/trading controls, stock comparison and conditional-alert entry points, and the latest stock-tagged community posts.
- Added direct hub navigation from `/stocks` market cards.

## Files

- `frontend/src/app/stocks/[symbol]/page.tsx`
- `frontend/src/app/stocks/page.tsx`
- `frontend/src/app/stocks/stock-hub.ts`
- `frontend/src/app/stocks/stock-hub.test.ts`
- Living Plan/changelog/worklog English/Korean parity files.

## Validation

- `pnpm lint`: PASS; only 11 pre-existing `no-img-element` warnings outside this change.
- `pnpm typecheck`: PASS after rebasing to latest main.
- `pnpm test`: PASS; contract 23, database 7, backend 852 passed / 353 environment-gated skipped, frontend 551 passed. New stock-hub tests: 3/3 PASS.
- Real PostgreSQL integration suites remain environment-gated where the repository marks them skipped; no schema or DB write contract changed in this slice.

## Release state

- Test deployment, exact-SHA staging verification, main merge, production deployment and production smoke must be recorded only after direct evidence exists.
