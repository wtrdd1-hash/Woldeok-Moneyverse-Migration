# Event calendar entry point — v2026.09.12.10

## Summary
The authenticated event calendar added in v2026.09.12.8 is now discoverable from the member quests surface instead of requiring a direct URL.

## Change
- Add a concise schedule card near the top of `/quests`.
- Link the card to `/calendar`.
- Explain that the calendar currently combines season-event deadlines, today's early-game event, and weekly goal reset timing.

## Product contract
The link does not introduce new event data or mutation paths. `/calendar` continues to read only existing authoritative backend APIs. Virtual-stock and shop schedules remain excluded until authoritative server feeds exist.

## Validation
Run frontend typecheck/build and the full repository CI, then rebuild and redeploy the exact test candidate SHA before Production promotion.
