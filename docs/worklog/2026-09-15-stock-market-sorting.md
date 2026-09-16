# v2026.09.15.123 — Stock market sorting

## User benefit
Members can quickly surface the strongest movers, highest-priced stocks, most available shares, or browse alphabetically without losing precision on very large economy values. Sort state is encoded in `?sort=` so the view can be bookmarked or shared.

## References
- Next.js App Router guidance recommends URL search parameters for bookmarkable/shareable view state.
- W3C WAI guidance informed native keyboard controls and explicit current-state semantics.

## Implementation and safety
Changed `frontend/src/app/stocks/page.tsx` and added `stock-market-sort.ts` plus focused tests. No API, database, ledger, authorization, idempotency, migration, or Production data path changed. Exact percentage ordering uses cross multiplication over `BigInt` values instead of floating-point division.

## Validation
Contract build PASS; frontend Vitest 66 files / 603 tests PASS; frontend typecheck PASS; Next.js production build PASS. Repository CI and exact-SHA Test deployment remain promotion gates after push.
