# Marketplace minimum-quantity filter — v2026.09.14.93

## Added

- Added a member-side minimum held-quantity filter to the Marketplace workbench.
- The filter composes with existing search, category, rarity, effect, state and sort controls.
- URL input is normalized server-side: non-integer/negative values are ignored and very large values are bounded before filtering.

## Safety boundary

- This is a read-only holdings discovery change.
- It reuses the existing authoritative `/api/v1/shop/holdings` response.
- No listing, transfer, escrow, crafting settlement, purchase, database migration or economy mutation was added.
