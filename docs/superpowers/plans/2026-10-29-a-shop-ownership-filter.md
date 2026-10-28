# Shop catalogue ownership filter — A0425 implementation plan

**Goal:** Allow authenticated members to select all, already owned, or not yet owned shop items, consistently across web, backend, existing PostgreSQL owner-scoped read function and Android app-api. Existing public catalogue and purchase behavior stay unchanged.

**Design:** `GET /api/v1/shop/catalog?ownership=owned|unowned|all` (default all). Reject invalid values before DB access. Filter `user_owned_quantity` from existing `shop_catalog_list_v2(actor UUID)`; this SECURITY DEFINER function joins `user_items` by authenticated actor and grants only EXECUTE. Do not introduce migrations, direct table access, or finance writes. Fail closed on malformed DB quantity rather than reporting a false ownership state. Web uses same API with no-store and noindex; search stays compatible. Android app-api forwards query unchanged and prevents caching on success/error. Keep the existing separate holdings read and error state intact.

**TDD steps:** (1) RED backend tests for strict enum, owner-scoped quantity and query composition; GREEN backend filter/controller. (2) RED web tests for validated URL and UI state; GREEN server-rendered control. (3) RED Android gateway tests for ownership query and private cache; GREEN only if necessary. (4) Focused tests, full gates, isolated real PostgreSQL read-only role proof, exact SHA CI, branch audit, latest main check, draft PR, release hold unless all gates PASS.

**Rollback:** Revert candidate application commit only; no migration, feature flag, financial data or production release. Branch and PR remain intact if release gate fails.
