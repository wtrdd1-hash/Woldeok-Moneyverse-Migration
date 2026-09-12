# Product Planning Worklog — v2026.09.12.25

Date: 2026-09-12
Branch: `docs/business-operations-supply-chain-v2026.09.12.25`
Scope: documentation-only business operations and supply-chain planning

## Starting state

- Read current Living Project Plan from `main`.
- Reviewed current Detailed Product Design business section, Economy Sinks business coverage and `docs/features/businesses.md`.
- Inspected the existing jobs/business migration seed to understand current fixed daily-revenue data and legacy `daily_limit` fields.
- Checked open PRs so this documentation scope would not overwrite active runtime work.

## Gap selected

Business design was materially shallower than newer marketplace, banking, club and community planning. The existing planning described starter businesses and a daily profit equation but did not fully define procurement, inventory reservation, operating runs, shipment states, branch networks, maintenance, business sink classification, API/DB contracts or unlimited-default behavior.

## Research reviewed

- Microsoft Learn — PlayFab Economy V2 Stores, current documentation observed 2026-09-12: separates catalog identity from contextual Store pricing.
- Microsoft Learn — PlayFab Inventory/idempotent transaction guidance, current documentation observed 2026-09-12: write operations can use idempotency identifiers to make retries safe.
- EVE Online — Monthly Economic Report August 2026, published 2026-09-09: reports economic activity and price-index trends and exposes raw data.
- TradingView — current demo/Paper Trading and Bar Replay materials observed 2026-09-12: simulated learning is separated from real-money exposure.

## Changes

- Added English-primary and Korean-parity Business Operations & Supply-Chain Specification.
- Defined business lifecycle, procurement modes, inventory model, storage expansion, demand formula, operation-run contract and atomic settlement.
- Defined branch and shipment lifecycles, maintenance/recovery rules, advertising, contracts, specialization, prestige and fictional protection service.
- Added a sink table with price seeds/curves, repeatability, player value, P2W boundary and ledger transaction types.
- Applied `null = unlimited` policy to ordinary business growth while preserving true scarcity/security/system-safety/market-integrity protections.
- Added Season 1 and Season 2 integration plus D-14/D-7/D-3/D-1 transition communication.
- Added recommended database entities, API surface, error taxonomy, admin config, economy dashboard metrics, analytics, abuse controls, implementation phases and definition of done.

## Implementation drift found

Existing applied repository migrations contain seeded `daily_limit` values for jobs and fixed daily-revenue/operating-cost business data. Those applied migrations are immutable. This planning change records the mismatch but deliberately does not mutate runtime data. Any future implementation must use a new forward migration/policy version and independently pass Test.

## Mid-work repository recheck

Recheck `main` immediately before PR creation. If `main` changed after branch creation, compare the head and confirm whether any planning files overlap before finalizing.

## Validation

Documentation-only. No code, schema, migration, API behavior or deployment manifest changed. Test-server deployment is not required for this revision.

## Next priorities

1. Create the initial business input/output SKU and recipe catalog (50+ concrete items).
2. Specify business owner UI screen-by-screen, including empty/loading/error/review states.
3. Specify admin Business Policy console and version-preview UX.
4. Add business scenario simulations by wealth cohort and archetype to Economy Scenario Lab planning.
5. Reconcile legacy job `daily_limit` and fixed business settlement behavior through a separate forward-only implementation plan.
6. Expand Season 2 Industrial Expansion with exact workshop/warehouse recipes, logistics quests and cooperative production goals.