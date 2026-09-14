# Marketplace acquisition-window filter v2026.09.14.94

## Added

- Added a recent-acquisition filter to the authenticated `/marketplace` holdings workbench.
- Members can narrow authoritative holdings to items acquired within the last 7 or 30 days.
- The filter composes with existing search, category, rarity, effect, minimum-quantity, item-state and sort controls.

## Safety

- Reuses the existing authoritative `GET /api/v1/shop/holdings` read model.
- No listing, purchase, transfer, escrow, crafting settlement, price write or database migration is introduced.
- Invalid or future acquisition timestamps are excluded from recent-window results instead of being treated as trusted inventory history.
