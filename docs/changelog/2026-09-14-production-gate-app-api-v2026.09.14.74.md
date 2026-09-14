# v2026.09.14.74 — Production gate API path fix

## Summary
- Correct the production release test gate to probe the deployed BFF route `/app-api/v1/shop/public-catalog`.
- Preserve the fail-closed exact-SHA, backend/database, and `noindex` checks.

## Verification
- Confirmed the isolated test backend returns HTTP 200 and a non-empty `catalogItems` array on `/app-api/v1/shop/public-catalog`.
- The obsolete `/app-api/shop/public-catalog` probe returned frontend HTTP 404 and incorrectly blocked production promotion.
