# Economy Sink Catalog — v2026.09.12.7

Date: 2026-09-12
Scope: product planning/documentation only

## Added

- Added implementation-ready `ECONOMY_SINK_CATALOG.md` and Korean parity document.
- Defined canonical sink config with `null`/unlimited as the default for non-protection limits.
- Defined strict `HARD_SINK`, `TRANSFER`, and `CONVERTER` accounting classification.
- Added concrete P0/P1/P2 sink inventory across profile, collections, housing, business, crafting, market, banking, logistics, clubs, community projects, professions, prestige and seasons.
- Added planning price seeds and scalable price curves instead of arbitrary play-count caps.
- Added ledger transaction type naming for sink attribution and reconciliation.
- Added privacy-safe sink analytics events and economy dashboard metrics.
- Added operational review triggers for net issuance, sink concentration and high-wealth balance growth. These triggers require review and never automatically cap player activity.
- Added season-specific WLD sinks including an unlimited voluntary Legacy Museum donation model.
- Added runtime Definition of Done covering atomic ledger debit, idempotency, configuration versioning, PostgreSQL integration validation, staging and production reconciliation.

## Research/design rationale

- Current PlayFab store documentation reinforces a catalog/store split where item definitions and store pricing/availability can be managed separately; Moneyverse mirrors this by keeping sink identity stable while putting tunable prices/availability in versioned server configuration.
- Current TradingView Paper Trading/Bar Replay and competition patterns reinforce the value of isolated practice/competition contexts. Moneyverse keeps risk/safety education free and isolates season/league economy from main WLD while allowing cosmetic or archival spending around those systems.

## Validation

Documentation-only change. No runtime, API, database schema or deployment behavior changed. Test-server deployment is not required for this version. Any runtime implementation derived from this document must use a separate development branch and pass exact-candidate staging validation before production.
