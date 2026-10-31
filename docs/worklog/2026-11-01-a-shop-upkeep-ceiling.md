# Development A: Verified shop upkeep ceiling — 2026-11-01

## Before work
- Main fetched, source reviewed and isolated worktree created; existing shared changes preserved.
- P1: web sends `maxUpkeep` but the catalog controller does not bind it; numeric legacy `filter` is a price filter for real catalog rows, not upkeep. Android lacks strict upkeep query/response verification.
- No schema or finance writes. Database source: `public.shop_catalog_list_v2(actor)` with exact `maintenance_cost::text`.

## Plan
1. RED tests: explicit public/member maxUpkeep and invalid input before DB access; web filter truth; Android duplicate/invalid/forged response.
2. GREEN: bind explicit parameter, BigInt upkeep comparison, fail closed for malformed source; Android query + response validation, private member headers.
3. Verify: targeted/full lint/typecheck/unit/build/security/a11y/app-api; read-only real PostgreSQL; refresh main, CI, PR; no merge/deploy without Test exact SHA.

## In progress
- TDD RED pending.

## Finished
- Pending verification and release HOLD.
