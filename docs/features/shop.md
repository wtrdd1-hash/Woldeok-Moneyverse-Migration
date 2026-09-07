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
