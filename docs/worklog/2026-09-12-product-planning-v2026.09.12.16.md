# Product Planning Worklog — v2026.09.12.16

Date: 2026-09-12
Branch: `docs/player-market-crafting-v2026.09.12.16`
Scope: Player Marketplace + Crafting product planning; documentation only

## Starting point

Re-read the latest planning stack before writing: Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec, Default Limit Policy, Economy Sinks Spec, Economy Sink Catalog, plus the current Personal Spaces & City Projects integration branch/PR.

The economy documents already contained marketplace listing/sale fee seeds and basic crafting sink ideas, but the repository did not yet have a complete implementation-oriented specification for:

- item transferability policy;
- escrow ownership;
- listing/settlement state machine;
- simultaneous buyer handling;
- atomic WLD/item settlement;
- retry/idempotency behavior;
- deterministic recipe contracts;
- player-market abuse detection;
- marketplace/crafting DB/API/admin contracts;
- season and personal-space integration.

That gap was selected for this planning revision because it adds multiple repeatable WLD sinks while preserving the unlimited-by-default participation model.

## External research

Fresh sources reviewed during this pass:

1. Microsoft PlayFab Economy V2 Catalog/Stores documentation — separates canonical catalog identity from Store-specific prices/availability.
2. Microsoft PlayFab Economy V2 Inventory documentation (updated 2026) — supports item transfers, transaction history, batched atomic inventory operations, and idempotency IDs for retry-safe writes.
3. Microsoft PlayFab idempotent transaction guidance (2026-04-15) — recommends one logical idempotency ID per operation and returning the original result on duplicate retry.
4. EVE Online Monthly Economic Report — March 2026 — continues to report faucets and sinks separately, reinforcing the requirement that Moneyverse marketplace GMV/transfer volume must not be counted as currency destruction.

## Product decisions

- P0 marketplace is fixed-price only.
- There is no ordinary active-listing, purchase-count or crafting-count hard cap.
- Listing spam is controlled through meaningful listing fees, request protection and anomaly detection rather than gameplay ceilings.
- Existing planning fee seeds remain: listing fee `max(25 WLD, 0.10% of listed value)` and settled-sale fee `1%`.
- Buyer-to-seller principal is `TRANSFER`; only marketplace/crafting/system fees count as `HARD_SINK`.
- Listed items move to logical system escrow and cannot simultaneously be used/crafted/transferred.
- A purchase settles buyer debit, seller credit, fee burn and ownership transfer atomically.
- P0 crafting is deterministic-first; hidden-probability paid crafting is not introduced.
- Season rank/prestige rewards default account-bound; Season Token and League WLD cannot be marketplace payment currencies.
- Integrity controls target self-trade, circular trading, wash volume, listing/reference-price manipulation, bot flooding and duplicate settlement without silently confiscating unrelated assets.

## Added documentation

- `docs/planning/PLAYER_MARKETPLACE_CRAFTING_SPEC.md`
- `docs/planning/PLAYER_MARKETPLACE_CRAFTING_SPEC.ko.md`
- EN/KO changelogs for v2026.09.12.16
- EN/KO internal planning worklogs
- documentation index entries

## Mid-work upstream recheck

At task start, `main` was `c318048d3604876a285f34dd9523bd1de1eaa03b` and Personal Spaces integration PR #170 was open.

During work, `main` advanced to `0f5b7ac5d196487459f8ecbf2f36ffeaad2b5122` through the hourly integration-audit documentation merge. PR #170 was also refreshed onto that newer base. The concurrent change is operational/audit documentation and does not modify the product-planning contracts touched by this revision.

This revision remains intentionally stacked on the latest Personal Spaces planning line so it can reuse that specification without duplicating or losing it.

## Validation

Documentation-only change. No application code, API implementation, database migration, ledger behavior or deployment state changed. Test-server deployment is not required for this planning revision.

Runtime implementation derived from this specification must use a separate development branch and must validate, at minimum:

- real PostgreSQL migration parity;
- item ownership and escrow invariants;
- concurrent purchases of one listing;
- buy/list/cancel idempotency;
- buyer debit/seller credit/fee burn/ownership reconciliation;
- crafting input/output atomicity;
- self-trade and abuse controls;
- backend/API startup and representative real user flows on the exact Test candidate SHA.

Only after Test passes may the exact verified revision be promoted to Production.

## Next priorities

1. define 50+ launch crafting recipes/material SKUs across housing, collections, business and seasons;
2. define marketplace wireframes and seller/buyer notification rules screen-by-screen;
3. design Season 1/Season 2 tradable vs bound item matrices and archive timing;
4. model marketplace fee burn, transfer velocity and crafting sink adoption by wealth cohort;
5. map marketplace/crafting contracts onto the repository's current ledger/inventory schema before implementation;
6. reconcile older season planning numbers that still read like hard caps with `DEFAULT_LIMIT_POLICY.md` during the next season-spec revision.