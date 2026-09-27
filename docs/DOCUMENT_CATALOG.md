# Documentation Catalog

**English canonical** | [한국어](DOCUMENT_CATALOG.ko.md)

> Snapshot: v2026.09.27.467
> Source tree: `main@d64eaedccb7c094063b36fb5f46590ce19f51ab1`
> Purpose: navigation and cleanup inventory; not product authority.

## Current authority

- [Project plan](planning/PROJECT_PLAN.md) — current implementation-facing authority, presently **v2026.09.25.444**.
- [Integrated planning master](planning/INTEGRATED_PLANNING_MASTER.md) — planning/governance ledger, with v466 documentation cleanup record.
- [Documentation policy](DOCUMENTATION_POLICY.md) — authority, language, branch, archive and drift rules.
- [Documentation index](INDEX.md) — curated navigation.
- [Full planning re-review v402](planning/INTEGRATED_FULL_REVIEW_V402.md) — **historical review snapshot**, not the current authority.

## Authority drift snapshot

- Repository `main` is at runtime/source history **v2026.09.27.466**.
- `PROJECT_PLAN.md` is at **v2026.09.25.444**.
- Therefore versions after v444 are not assumed to be integrated product-planning authority merely because runtime commits or execution notes exist.
- This catalog records the drift; it does not resolve product decisions by renumbering the plan.

## Inventory snapshot

There are **1,638 files under `docs/`**, including **1,620 Markdown files**.

| Collection | Files |
|---|---:|
| worklog/ | 545 |
| changelog/ | 424 |
| planning/ | 279 |
| updates/ | 160 |
| docs root | 63 |
| releases/ | 58 |
| findings/ | 22 |
| operations/ | 22 |
| features/ | 20 |
| superpowers/ | 11 |
| architecture/ | 10 |
| api/ | 9 |
| images/ | 9 |
| design/ | 2 |
| localization/ | 2 |
| research/ | 2 |

Across the repository, **1,726 documentation-related files** were observed when root README/workflow text artifacts and non-`docs/` documentation are included.

## Cleanup findings

- Root-level dated Markdown files under `docs/`: **18**. They are legacy placements; new dated documents must use the appropriate collection directory.
- Exact duplicate-content groups under `docs/`: **31** groups, representing **31 extra duplicate paths**. Existing paths are preserved in this cycle to protect history and inbound links.
- Markdown pairing inventory found **85 English-path documents without a Korean pair** and **19 Korean-normalized paths without an English pair**. These counts include historical, internal-only, API legacy and third-language material; they are not all current-maintenance parity violations.
- Root `implementation_plan.md`, `PROJECT_MEMORY.md` and `walkthrough.md` are execution/history references, not product authority.
- The prior catalog snapshot v403 is superseded by this inventory.

## Cleanup rule

Do not mass-delete or mass-move historical records. A future deduplication must choose one canonical path, update inbound references, retain a compatibility stub when needed, and prove link integrity in the same change.
