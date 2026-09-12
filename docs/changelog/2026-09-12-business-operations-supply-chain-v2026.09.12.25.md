# Business Operations & Supply Chain — v2026.09.12.25

Date: 2026-09-12

## Added

- Added `BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.md` with Korean parity.
- Expanded businesses from fixed daily revenue/cost assets into active procurement, inventory, operation, logistics, settlement, maintenance and branch-network loops.
- Applied unlimited-by-default policy to ordinary business ownership, branch count, procurement count, operating runs and storage expansion.
- Added explicit `HARD_SINK`, `TRANSFER`, `CONVERTER`, `HOLD` and `FAUCET` accounting for business flows.
- Added implementation-ready business sink catalog for registration, storage, branches, remodeling, branding, advertising, maintenance, logistics, certifications, archives, headquarters and protection services.
- Added progressive storage/branch/HQ price curves instead of arbitrary growth caps.
- Added server-authoritative demand and operating-run models with atomic idempotent settlement.
- Added business shipment, contract, advertising, specialization, prestige and fictional protection-service designs.
- Added Season 1 onboarding/business goals and Season 2 Industrial Expansion integration.
- Added recommended DB entities, API contracts, error taxonomy, analytics events, admin config, dashboard metrics and definition-of-done criteria.
- Recorded existing migration drift: seeded job `daily_limit` values and fixed daily-revenue business data require a future forward-only policy reconciliation rather than editing applied migrations.

## External references reviewed

- Microsoft PlayFab Economy V2 Stores: catalog identity and store-specific price overrides.
- Microsoft PlayFab Inventory / idempotent transaction guidance: retry-safe value-changing writes.
- EVE Online Monthly Economic Report — August 2026 (published 2026-09-09): live virtual-economy activity and price-trend observability.
- TradingView demo/Paper Trading and historical replay documentation: virtual learning separated from real-money exposure.

## Validation

Documentation-only. No runtime, API, database migration or deployment behavior changed. Test-server deployment is not required for this documentation revision. Any runtime implementation derived from this spec must use a separate development branch and pass exact-SHA isolated Test validation before Production.