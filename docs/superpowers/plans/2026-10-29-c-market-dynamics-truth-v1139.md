# C v1139 implementation plan
1. Add RED tests for malformed/NULL PostgreSQL numeric strings, negative volatility, huge gap overflow, inconsistent global trend, and valid market rows in `frontend/src/app/admin/market/market-metrics.test.ts`.
2. Add focused `market-metrics.ts` functions with explicit unknown semantics; no synthetic values.
3. Correct nullable fields of `StockDynamicsRow` and `AdminStockDynamics` to reflect migration 124's LEFT JOIN and missing market regime.
4. Wire helper into `frontend/src/app/admin/market/page.tsx`; preserve SSR, noindex, mobile table, keyboard navigation; add accessible warning.
5. Re-run RED→GREEN and all practical exact-SHA gates; inspect CI; do not deploy on failure.
