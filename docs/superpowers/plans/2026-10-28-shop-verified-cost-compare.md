# Shop verified two-item cost comparison — bounded implementation plan

Base: origin/main b1cd54fda1123fb07ca81b6e5b3ead70f59f556c. This is a P1 read-only member feature; planning PR #1630 is unmerged and must not be treated as approved release policy.

1. **Data contract & RED**: Test a strict exactly-two-distinct-UUID parser, canonical integer-string WLD and upkeep difference, unknown/withdrawn item refusal. The authoritative source is `shop_catalog_list_v2(actor)` via the existing `ShopCatalogRepository.catalog`, not user-submitted prices, client mock values or direct table grants. No SQL migration or ledger write.
2. **Backend/API**: Add authenticated+consented GET `/api/v1/shop/compare?ids=id1,id2`, bounded validation, owner-specific catalogue pricing and a clear `source` marker. No speculative discount or inventory guarantee. Tests for malformed/unknown IDs, huge WLD values, equal prices and unavailable DB.
3. **Frontend**: Add accessible two-item selector to the existing shop grid and a fail-closed comparison panel. Fetch from `/app-api/v1/shop/compare` with no-store; never show invented totals on failure. Keep guest catalogue public and member comparison gated.
4. **Android app-api**: Existing allowlisted shop group proxies the route; enforce no-store even when upstream is cacheable. Add proxy contract test.
5. **Verification**: RED→GREEN, unit/e2e, backend/frontend build/typecheck/lint, real isolated PG read-model/ACL if feasible, security/a11y/SEO, CI and exact-SHA Test gate. Draft/HOLD on any blocker. Preserve all other agents' work and never deploy without full release gates.
