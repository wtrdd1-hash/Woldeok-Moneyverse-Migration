# Development B v717 — stock owner HTTP privacy

## Before work (2026-11-01 11:03 KST)
- Main f13bbce273ffc65e8576170992d82ea00c27a1c9, Debian 13.6 miniPC, isolated branch.
- P1: owner stock watchlist, holdings, trade receipts and write responses lack a consistent pre-auth private-cache boundary; public price/market routes must remain cacheable.
- No new API routes, schema migrations, WLD or ledger writes.

## In progress
- [ ] RED real Nest HTTP tests for owner routes, rejected requests and public exemptions.
- [ ] GREEN targeted middleware and regression tests.
- [ ] Local verification and isolated DB evidence.

## Finished
- Pending; RELEASE HOLD, no merge/deploy.

## In progress (2026-11-01 11:04 KST)
- [x] RED: 7/11 HTTP tests fail on owner headers, 4 public controls pass.
- [x] GREEN: 11/11 pass after controller-scoped middleware with public GET/HEAD allowlist.
- [ ] Full regression, CI, Test exact-SHA and release gates.
