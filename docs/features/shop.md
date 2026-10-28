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

## Member ownership filter (A0425 candidate; not released)

Authenticated members can select **All**, **Owned**, or **Not owned** in `/shop/catalog`, combined with the existing text search. The member API accepts `GET /api/v1/shop/catalog?ownership=all|owned|unowned` (omitting the parameter means `all`). Other values return HTTP 400 before a private database read. The PostgreSQL `shop_catalog_list_v2(actor)` function returns the viewer's own `user_owned_quantity`; only this count is used, and invalid counts fail closed. No owner ID, client-submitted count, or direct table read is accepted. The public catalogue does not expose the filter. Android uses `/app-api/v1/shop/catalog?ownership=...`, forwarding the query while forcing private no-store and noindex responses. This candidate has no migration or financial write and is held from Production pending release gates.
