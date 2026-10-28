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

## Member catalogue category filter (A2225 candidate, not released)

The authenticated `/shop/catalog` page offers a category selector alongside text search.
`GET /api/v1/shop/catalog?category=vehicle` uses the existing actor-scoped
`shop_catalog_list_v2(actor)` read model, then applies an exact category token
filter. The API returns `categories` from the same actor-visible catalog so
new categories do not disappear from the selector. `q` and `category` combine
without client-supplied prices, arbitrary SQL, new grants, or ledger writes.
Malformed category tokens receive HTTP 400 before the database call. The
Android `/app-api/v1/shop/catalog` gateway preserves the query string and
forces private, no-store/noindex for member catalog, holdings and purchases.
This remains a Draft candidate until exact-SHA Test and release gates pass.
