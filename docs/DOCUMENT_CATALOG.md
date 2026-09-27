# Documentation Catalog

**English canonical** | [한국어](DOCUMENT_CATALOG.ko.md)

> Snapshot: v2026.09.27.468
> Source base: main@8493d69e2283bf6526b52752ea2242b707160830 plus this v468 planning delta
> Purpose: navigation and cleanup inventory; not product authority.

## Current authority

- [Project plan](planning/PROJECT_PLAN.md) — current implementation-facing authority, **v2026.09.27.468**.
- [Integrated planning master](planning/INTEGRATED_PLANNING_MASTER.md) — planning/governance ledger, **v2026.09.27.468**.
- [API observability control tower](planning/API_OBSERVABILITY_CONTROL_TOWER_SPEC.md) — P0 exact-source API inventory, telemetry truth and false-green release gate.
- [Documentation policy](DOCUMENTATION_POLICY.md) — authority, language, branch, archive and drift rules.
- [Documentation index](INDEX.md) — curated navigation.
- [Full planning re-review v402](planning/INTEGRATED_FULL_REVIEW_V402.md) — historical review snapshot, not current authority.

## Authority/runtime state

- Repository source history observed at v468 start is runtime/source **v2026.09.27.467** on main@8493d69.
- PROJECT_PLAN is now planning authority **v2026.09.27.468** because this cycle integrates the API-observability directive.
- This planning version does not claim the v468 runtime exists; API observability remains PLANNING until exact-SHA Test and Production evidence is created.
- Unrelated intervening runtime/product decisions are not silently adopted merely because their version numbers fall between v444 and v468.
- API_CATALOG_MASTER is explicitly AUTHORITY_DRIFT as an exhaustive-runtime claim until the v468 generated-manifest reconciliation is implemented.

## Inventory snapshot

There are **1,659 files under docs/**, including **1,641 Markdown files**.

| Collection | Files |
|---|---:|
| worklog/ | 549 |
| changelog/ | 428 |
| planning/ | 283 |
| updates/ | 167 |
| docs root | 63 |
| releases/ | 58 |
| findings/ | 24 |
| operations/ | 22 |
| features/ | 20 |
| superpowers/ | 11 |
| architecture/ | 10 |
| api/ | 9 |
| images/ | 9 |
| design/ | 2 |
| localization/ | 2 |
| research/ | 2 |

## Cleanup findings

- Root-level dated Markdown files and historical duplicate groups remain preserved unless a separate link-safe cleanup cycle supersedes them.
- The v468 additions are maintained EN/KO pairs: detailed specification, planning delta, worklog, changelog, public update and internal update.
- Root implementation_plan.md, PROJECT_MEMORY.md and walkthrough.md remain execution/history references, not product authority.
- Inventory counts are a snapshot, not a quality score.

## Cleanup rule

Do not mass-delete or mass-move historical records. A future deduplication must choose one canonical path, update inbound references, retain a compatibility stub when needed, and prove link integrity in the same change.
