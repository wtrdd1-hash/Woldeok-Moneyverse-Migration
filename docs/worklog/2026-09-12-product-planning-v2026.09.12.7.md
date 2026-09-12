# Internal Worklog — Product Planning v2026.09.12.7

Date: 2026-09-12
Scope: economy sink implementation planning; documentation only
Branch: `docs/economy-sink-catalog-v2026.09.12.7`

## Inputs reviewed

- latest `main` Living Project Plan;
- consolidated planning PR #159 (`integrate/hourly-20260912-1301`), rechecked before and mid-work;
- Default Limit Policy;
- Economy Sinks Specification;
- Season System Specification and related product planning documents;
- Microsoft PlayFab store/catalog documentation;
- current TradingView Paper Trading, Bar Replay and competition material.

## Gap selected

The Economy Sinks Specification already established the strategy but explicitly left the exact P0 SKU/price catalog unfinished. The highest-value next planning step was therefore implementation detail rather than another list of sink ideas.

## Decisions

1. Preserve unlimited-by-default play. Product-facing quantity/count caps default to `null` unless a real protection reason exists.
2. Separate true burn (`HARD_SINK`) from user-to-user transfer and conversion at data-model, ledger and dashboard levels.
3. Introduce a canonical versioned sink-config contract with server-authoritative quotes and idempotent atomic mutation.
4. Provide low-, mid-, high- and ultra-high-wealth voluntary spending opportunities without purchasing economic/competitive power.
5. Use fixed/geometric/piecewise/global-index/project-stage price curves to absorb wealth through desirable progression rather than punitive wealth confiscation.
6. Make season-end legacy donations and city projects scalable high-capacity sinks with prestige-only recognition.
7. Keep safety, account security and required financial-risk education free.
8. Treat review thresholds as operator signals, never as automatic player activity caps.

## Files added/updated

- `docs/planning/ECONOMY_SINK_CATALOG.md`
- `docs/planning/ECONOMY_SINK_CATALOG.ko.md`
- `docs/changelog/2026-09-12-economy-sink-catalog-v2026.09.12.7.md`
- `docs/changelog/2026-09-12-economy-sink-catalog-v2026.09.12.7.ko.md`
- `docs/worklog/2026-09-12-product-planning-v2026.09.12.7.md`
- `docs/INDEX.md`

## Validation

- Documentation-only; no runtime/API/schema changes.
- English canonical document and Korean parity maintained.
- Mid-work upstream/PR recheck showed PR #159 still open and on the same head SHA used as this branch base.
- Test-server deployment not required for docs-only planning.
- Runtime implementation must use a separate development branch, real-PostgreSQL integration testing for ledger-impacting behavior, exact-candidate staging, then production promotion only after validation.

## Next priorities

1. convert the P0 catalog into candidate DB seed/config records and admin-console field definitions;
2. design housing/office information architecture and catalog browsing UX;
3. specify city-project lifecycle, contribution ledger, recognition and archive screens;
4. simulate issuance-vs-sink coverage by new/established/advanced/high-wealth cohorts;
5. define season-specific sink families for Season 1 and Season 2 without simple price inflation;
6. integrate sink metrics into the admin economy dashboard specification.
