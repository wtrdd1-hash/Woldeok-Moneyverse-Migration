# Shop upkeep ceiling truth — implementation plan (2026-11-01)

## Context / decision
The public `/shop` form sends `maxUpkeep` but Nest `GET /shop/public-catalog` and `GET /shop/catalog` only accept `q/filter/sort/category`. The existing backend test calls the second positional argument as if it were an upkeep ceiling; the controller instead interprets it as a generic filter. This can display products above the selected weekly upkeep ceiling, a materially misleading WLD commitment. Existing `shop_catalog_list_v2(actor)` supplies canonical `maintenance_cost` strings; do not create a migration or alter financial data.

## Scoped design
Add an explicit optional `maxUpkeep` parameter on both catalogue routes, validated before DB read using `parseShopUpkeepCap`, and apply `filterShopUpkeep` to the DB-returned rows after existing filters. Retain legacy `filter/sort/category` behavior; avoid generic overload and keep exact BigInt precision. In the web `/shop` view, do not describe an invalid or unavailable source as a verified filtered result. In Android `/app-api/v1/shop/{catalog,public-catalog}`, validate canonical ceiling/duplicate query keys before forwarding; on successful upstream JSON, independently verify every returned `maintenance_cost` is canonical and <= requested ceiling, fail closed with 503 otherwise. Public catalog remains public; owner catalog remains authenticated; no additional grants, writes, or migrations.

## TDD and verification
1. Record baseline red with existing upkeep controller tests, add red cases for direct `maxUpkeep` and invalid/duplicate gateway query.
2. Implement Nest controller explicit param and exact filter; ensure previous positional tests updated to actual signature; verify legacy filters remain unchanged.
3. Implement Android edge verification and web truthful state with regression tests.
4. Run focused backend/frontend tests, typecheck, lint, build, API contract; read-only DEV PostgreSQL `shop_catalog_list_v2(NULL)` sample under `moneyverse_app` with transaction rollback. Run broad suites only when resource capacity permits. Record exact SHA and HOLD on any incomplete gate.
5. Re-fetch main and planning before any merge; create Draft PR, never deploy or merge without exact-SHA full CI, isolated Test/auth E2E, least-privilege, restore, GitOps evidence.

## Rollback
Revert this additive API/UI/edge change. No schema or financial mutation.
