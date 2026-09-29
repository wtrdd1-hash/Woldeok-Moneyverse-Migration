# v2026.09.29.486 — Database Reference Expansion Worklog

> Date: 2026-09-29
> Status: IN_PROGRESS
> Branch: `docs/db-reference-expansion-v2026.09.29.486`
> Start main: `64201629c5cdf931d49e48e8808fc0f882318b3b`
> Scope: research/planning/documentation only; no runtime schema or Production mutation is authorized by this cycle.

## Objective
Expand the existing v443 database discovery corpus from 66,858 deduplicated candidates to **more than 100,000 unique database-related references**, preserve provenance and deduplication evidence, and re-review database planning against directly checked primary sources.

## Start record
- Current `origin/main` was fetched and matched local main at `64201629` before isolation.
- The dirty shared main checkout was left untouched; work is isolated in `/home/debian/wt-db-reference-v486` to avoid conflicts with concurrent agents.
- Authoritative order rechecked: `PROJECT_PLAN` → `INTEGRATED_PLANNING_MASTER` → adopted detailed specs → generated/runtime contracts → historical evidence.
- Existing v443 evidence re-read: 80,000 raw Crossref records -> 66,858 DOI-first/title-fallback deduplicated candidates.
- Repository documentation inventory was scanned programmatically before new research; database-relevant documents and the canonical DB architecture spec were prioritized for full read.
- The Android app checkout was also inventoried for database-specific project documentation; no separate DB architecture authority was identified there.
- Corpus size is discovery breadth only. It is not a claim that every record was manually read, database-specific, or adopted.
- Production-facing requirements may be changed only from directly checked primary/official sources plus repository evidence.

## Planned checkpoints
1. v486-01 — start record, authority/document inventory, current-main baseline.
2. v486-02 — collect focused database discovery lanes and deduplicate against v443.
3. v486-03 — verify primary PostgreSQL/security/recovery/operability sources and sample corpus quality.
4. v486-04 — re-fetch `origin/main` and reconcile concurrent planning changes.
5. v486-05 — update DB research review/spec/integrated planning, EN first + KO counterpart.
6. v486-06 — verify counts/hashes/docs parity, internal/GitHub update notes, push branch and open PR.
