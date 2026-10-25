# A0425 — Private inventory CSV snapshot

## Intent / constraints
Members need a portable record of **current** held virtual cosmetic items, not a purchase history or financial receipt. Preserve member-only access and the DB's SECURITY DEFINER owner filter. Do not write to the financial ledger, alter applied migrations, or claim a complete export if the source exceeds a bounded cap.

## Design
1. Backend: GET /api/v1/shop/holdings/export-snapshot, guarded by SessionGuard, AuthenticatedGuard, ConsentGuard. Reuse ShopCatalogRepository.holdings(actor), fail closed if >100, return { holdings, complete: true }. No actor parameter accepted. Existing PostgreSQL shop_my_items_v2(p_actor) remains the sole read boundary.
2. Next.js: GET /api/shop/holdings/export, call the guarded backend path, validate every holding (UUID, canonical bounded quantity, nonempty bounded strings, valid UTC date, equip flag), reject malformed/oversized payload and upstream failure. Quote every cell and neutralize spreadsheet formulas and invisible controls. Response BOM, CRLF, attachment, private/no-store, nosniff, noindex.
3. Inventory page: authenticated member download link and truthful unavailable state; no index. Android: existing app-api/v1 gateway proxies backend endpoint, forwards session, preserves no-store and denial; add contract tests.
4. TDD: write failing tests first for guard, 100/101 boundary, CSV escaping, malformed data, authorization failure, Android proxy; then implement and rerun.
5. Validate: focused tests, full build/typecheck/lint/tests, DB packages, real isolated PostgreSQL read-only ACL/owner check, audits, E2E and exact-SHA CI/Test; HOLD on any failure. Never deploy from feature branch.

## Rollback
No schema/data migration. Disable download link/route by reverting feature commit after approval; never mutate balances or member inventory data.
