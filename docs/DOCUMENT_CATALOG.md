# Documentation Catalog

**English canonical** | [한국어](DOCUMENT_CATALOG.ko.md)

> Snapshot: v2026.09.23.403
> Purpose: navigation and cleanup inventory; not product authority.

## Current authority

- [Project plan](planning/PROJECT_PLAN.md)
- [Integrated planning master](planning/INTEGRATED_PLANNING_MASTER.md)
- [Full planning re-review v435](planning/INTEGRATED_FULL_REVIEW_V435.md)
- [Documentation policy](DOCUMENTATION_POLICY.md)

## Inventory snapshot

There are **1,497 files** under `docs/` in this cleanup snapshot.

| Collection | Files |
|---|---:|
| worklog/ | 515 |
| changelog/ | 410 |
| planning/ | 234 |
| updates/ | 130 |
| releases/ | 58 |
| docs root | 59 |
| operations/ | 20 |
| features/ | 20 |
| findings/ | 15 |
| architecture/ | 10 |
## Cleanup findings

- Root-level dated Markdown files: **18**. They are legacy placements; new dated documents must use the appropriate collection directory.
- Exact duplicate-content groups: **31**. These mostly reflect historical changelog/worklog/release duplication.
- Existing duplicate paths remain during this cycle to protect Git history and inbound links.
- A future deduplication must choose one canonical path, leave a compatibility stub at the old path, and update inbound references in the same change.
- Historical file count is not a quality metric. Current authority, explicit status and evidence quality are.

## Directory rule

Root-level `docs/` is reserved for indexes, governance and cross-cutting integration references. New planning, evidence, update, worklog, changelog and release records belong in their matching directories.

See each directory README for collection-specific rules.
