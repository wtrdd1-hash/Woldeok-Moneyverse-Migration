# B v697 — Marketplace Service Financial Settlement Hold

## Before work
- Baseline: `origin/main` 5bccda44d6db56aff05fa5623ef7f72b2ec0263c.
- P0 #2191: migration 232 marketplace listing fee, purchase and auction bid directly update balances without double-entry ledger postings. Source is callable from `MarketplaceService` even if a controller adds a hold.
- Distinct scope: service-layer fail-closed guard only. A #2192 owns fixed-price controller and forward migration; C #2181 owns auction controller/UI. Preserve both; no SQL migration, WLD write, or new endpoint.
- State: IN PROGRESS. Release HOLD.

## Planned verification
- [ ] RED service-level tests reject listing creation, purchase, auction bid before pool queries, proxy state or websocket events.
- [ ] GREEN code changes to MarketplaceService, no controller or migration edits.
- [ ] Targeted tests, lint, typecheck, build, full tests and exact-SHA gates as available.
- [ ] Final SHA, CI, Test/Production status, dependency audit and coordination.
