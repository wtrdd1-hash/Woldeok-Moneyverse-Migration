# Player Marketplace & Crafting — v2026.09.12.16

Date: 2026-09-12
Type: Product planning / documentation only

## Added

- Added `PLAYER_MARKETPLACE_CRAFTING_SPEC.md` as an implementation-oriented specification.
- Defined explicit item transfer policies: account-bound, system-only, tradable unique/stack, delayed-trade, season-restricted and club-bound.
- Defined fixed-price P0 marketplace scope, listing lifecycle, escrow, atomic settlement, idempotency and optimistic/concurrency controls.
- Preserved the unlimited-by-default policy: no ordinary listing-count, purchase-count or crafting-count hard cap.
- Kept existing economy-sink seeds: listing fee `max(25 WLD, 0.10%)` and settled-sale fee `1%` as configurable planning defaults.
- Classified buyer-to-seller principal as `TRANSFER` and marketplace/crafting fees as `HARD_SINK`.
- Added deterministic-first crafting, dismantling, recoloring, restoration, engraving, duplicate fusion, furniture fabrication and archive reconstruction.
- Added new marketplace/crafting sink seeds including appraisal, featured discovery placement, prestige restoration and fabrication services.
- Added season tradability rules and D-14/D-7/D-3/D-1 crafting/market continuity requirements.
- Added Personal Spaces and City Projects integration.
- Added self-trade, circular-trade, wash-volume, escrow-bypass, duplicate-settlement and bot-spam integrity controls.
- Added recommended PostgreSQL entities, API routes, admin-console requirements, economy metrics and analytics events.
- Added P0/P1/P2 rollout gates and runtime Definition of Done.
- Added Korean parity document.

## Research basis

- Microsoft PlayFab Economy V2 current inventory documentation: transfer operations, atomic batched inventory writes, transaction history and retry-safe idempotency patterns.
- Microsoft PlayFab Economy V2 current catalog/store guidance: catalog identity remains separate from store-specific pricing/availability.
- EVE Online March 2026 Monthly Economic Report: continued faucet/sink reporting reinforces separating marketplace transfer volume from true currency destruction.

## Compatibility and deployment

Documentation only. No runtime code, API, database schema, migration or deployment behavior changed in this revision. Test-server deployment is not required for the documentation change itself.

Any implementation derived from this specification must use a separate development branch, forward-only migrations, server-authoritative ledger/inventory writes, exact-candidate Test deployment and backend/API/PostgreSQL/idempotency/concurrency validation before Production promotion.