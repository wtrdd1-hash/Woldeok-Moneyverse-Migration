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

## Member catalogue exact price order (A2125 source candidate, not live)

Authenticated `GET /api/v1/shop/catalog?sort=price_asc|price_desc` returns the
existing actor-scoped `shop_catalog_list_v2` items ordered by the database's
canonical integer-string prices using `BigInt` (stable code/ID ties).
An absent `sort` preserves the existing database order; any other value is
HTTP 400 before reading the catalogue. The member web search form keeps its
chosen order, and the Android `/app-api/v1/shop/catalog` gateway forwards
the same query with private/no-store/noindex responses, including failures.
Ordering is informational only; a purchase still rechecks price, stock and
eligibility in its existing transaction. No migration, price lock or WLD debit
is introduced. Draft PR #1745 remains release-gated.
