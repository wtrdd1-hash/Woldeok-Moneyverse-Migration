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

## In progress — TDD and implementation
- RED: nine new backend assertions failed and ten frontend/Android assertions failed before the fix.
- GREEN: explicit `maxUpkeep` is validated before any database read, then filters `maintenance_cost::text` with BigInt after the existing owner-scoped `shop_catalog_list_v2` read. Malformed read-model upkeep fails with 503, not an unfiltered catalog.
- Next renders a retryable unavailable state instead of inventing zero products, and filtered search URLs are noindex. Android rejects duplicate/noncanonical ceilings and unverified 200 responses, and prevents member catalog caching.
- No new migration, ledger writes, privilege grant, or finance path change.

## Verification (candidate code)
- Backend full: 2,959 PASS / 517 SKIP, exit 0 in isolated transient service. First attempt failed before suite start from MCP cgroup pids exhaustion; no test failure claimed.
- Frontend full: 2,914 PASS / 0 FAIL (556 files), after final regression additions.
- Database unit: 62 PASS / 4 SKIP; contract 184 endpoints verified; typecheck PASS; lint 0 errors/1,022 warnings; Backend and Frontend builds PASS; production dependency audit no known vulnerabilities.
- Targeted accessibility/SEO/Android: 51 PASS; targeted backend security/shop: 11 PASS / 7 SKIP; repository security/release policy 4 PASS.
- Real PostgreSQL 17.11 DEV read-only app role: 146 public catalog rows; 140 zero-upkeep, 141 <=100 WLD, 5 >100 WLD; function EXECUTE true; transaction ROLLBACK. DEV `moneyverse_app` has direct DELETE on shop_catalog: P0 ACL remains unresolved. This is not a clean-schema or authenticated official Test proof.
- Public Production /api/version 353c6d5d..., official Test bc8cd8a6...; neither is this candidate. Official Test exact SHA E2E, independent restore, release gate: BLOCKED.

## Release state
- Draft PR only; no main merge, no branch deletion, no Test/Production deploy or DB write. Production HOLD until official Test exact-SHA authenticated end-to-end and P0 gates pass.
