# Personal Spaces & City Projects — v2026.09.12.11

Date: 2026-09-12
Scope: product planning/documentation only

## Added

- implementation-oriented Personal Spaces specification covering rooms, studios, galleries, offices, penthouses, HQs and legacy halls;
- unlimited-by-default ownership/expansion policy with progressive price curves instead of arbitrary account caps;
- server-authoritative layout revision, privacy, entitlement and idempotency rules;
- housing/decor sink taxonomy and canonical ledger transaction types;
- City Projects state machine, funding models, launch project catalog and contribution flow;
- logarithmic prestige/recognition that does not convert into economic or competitive power;
- Season integration for city projects and legacy archives;
- recommended DB tables, API surface, admin console requirements, analytics and economy dashboard metrics;
- concurrency, cancellation, reconciliation and rollback behavior;
- English-primary and Korean-parity specifications.

## Research incorporated

- Microsoft PlayFab Economy V2 Stores: canonical catalog identity with store-specific price/availability overrides.
- Microsoft PlayFab Inventory Collections: logical inventory separation under one player identity.
- TradingView The Leap 2026: separate preset competition accounts, reinforcing isolation between main and competitive simulated balances.

## Validation

Documentation-only. No runtime/API/database behavior changed. Test-server deployment is not required for this revision. Runtime implementation derived from this specification must use a separate development branch and pass the exact-candidate staging/test-server gate before Production.
