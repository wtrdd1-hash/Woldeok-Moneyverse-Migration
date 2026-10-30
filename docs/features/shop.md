# Shop & Inventory

The catalog shop converts WLD into virtual in-service items and collection progress.

## Price authority

The displayed effective price and the actual purchase price must come from the same server/database rule. A client-submitted price is never authoritative.

The market-sale quest effect demonstrates this rule: eligible starter items show and charge the same 10% discounted effective price for the active event day.

## Stock integrity

Catalog policy can include:

- base/effective price;
- active/inactive state;
- current stock;
- maximum stock for limited items;
- member ownership/inventory state.

Admin updates are routed through actor-checked database functions rather than direct `moneyverse_app` table updates.

## Validation

Database-side constraints reject invalid prices or impossible stock states, such as negative stock or limited stock exceeding its configured maximum.

## Related surfaces

- `/shop/catalog`
- member inventory/collections
- quests and progression

## Verified rarity filter (Development A candidate)

The public `/shop` and member `/shop/catalog` screens can select one exact database rarity: `common`, `uncommon`, `rare`, `epic`, `legendary`, `mythic`. Backend public/member catalog endpoints filter only `shop_catalog_list_v2` results; invalid values return 400. Search and rarity combine, prices remain integer strings, and owner inventory remains session-scoped. Android can use `GET /app-api/v1/shop/catalog?rarity=rare` with a persistent session. This is a Draft PR candidate only, not released.

## Owner-private recent purchase CSV (Development A candidate; not released)

Authenticated, consented members can request `GET /api/v1/shop/purchases/export` or Android `GET /app-api/v1/shop/purchases/export` with optional `q` (up to 80 Unicode characters, no control bytes). The response is `{ scope: "recent100", purchases: [...] }`, containing only the caller's most recent 100 purchases from the existing PostgreSQL `shop_list_my_purchases` owner-checked function. The optional item-name filter runs inside those recent 100. All WLD amounts remain canonical integer strings. The same-origin web download `GET /api/shop/purchases/export` produces UTF-8 CSV with a BOM and spreadsheet-formula escaping. All surfaces are private, no-store and noindex. Invalid or unverified reads fail closed; an empty list is valid only after a successful authoritative read. This is **not** a lifetime purchase statement or a certified financial document. Draft feature; Test/Production promotion remains on HOLD.
