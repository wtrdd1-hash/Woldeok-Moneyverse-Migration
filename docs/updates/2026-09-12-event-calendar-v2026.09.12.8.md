# Update v2026.09.12.8 — Economy/Event Calendar

## Summary

Implemented the first member-facing P1 economy/event calendar slice from the Living Project Plan.

## Added

- New authenticated `/calendar` page.
- Unified read-only view for active season-event end times.
- Today's deterministic early-game event status and Seoul-date rollover guidance.
- Weekly quest reset context derived from the authoritative early-game goal window.
- Direct navigation back to quest surfaces for actions; the calendar does not create a second mutation path.

## Data and safety contract

- No new database table or migration was required.
- Existing server-owned APIs remain authoritative for event state, rewards, prices, and progress.
- WLD values remain string-safe and are not converted to JavaScript `Number`.
- Failed reads are rendered as unavailable rather than guessed.

## Remaining scope

The Living Plan also calls for virtual-stock events and shop events to appear in the same calendar. Those event-specific date feeds do not yet exist as stable read contracts, so this version does not fabricate them. They should be added when authoritative backend schedules are available.

## Version

`v2026.09.12.8`
