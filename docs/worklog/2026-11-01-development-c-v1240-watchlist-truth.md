# Development C v1240 — Watchlist Source Integrity

## Before work — 2026-11-01 00:41 KST
- Host: Debian 13.6 miniPC, seven services active, development PostgreSQL connected.
- Starting canonical origin/main: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`.
- Reviewed AGENTS.md, README, Korean README, EN/KO project plans, open PRs and CI, recent QA, A/B and C work. Existing C PR #2225 handles protected HTTP headers; B #2227 handles marketplace settlement; no active watchlist change identified.
- Confirmed P1: `/stocks/watchlist` trusts unvalidated API values, and `BigInt()` may throw for malformed prices. `changeBasisPoints` truncates small movements and can mis-sort distinct changes. API source is authenticated `GET /api/v1/stocks/watchlist`, backed by `stock_my_watchlist(actor)`.
- Bounded design: fail closed on malformed/duplicate rows instead of rendering fabricated or partial results; preserve verified empty state; compare percent changes by exact cross multiplication; keep existing read-only API, no DB/ledger mutation. Mobile, keyboard, SEO and accessibility behavior must remain.
- Alternative rejected: dropping bad rows would falsely imply a shorter verified watchlist. Broad backend/schema changes unnecessary for this read-only correction.
- [x] RED regression tests. [x] GREEN source validation and exact sorting. [ ] Local focused and full verification. [ ] GitHub draft PR and final release HOLD evidence.

## In progress — 2026-11-01 00:43 KST
- TDD RED confirmed: new source-integrity test fails to import the not-yet-implemented parser (expected). Added query normalization and sub-basis-point label assertions before implementation.
- Worktree isolated under `/srv/moneyverse-data/tasks/mv-c-v1240-watchlist-truth/repo`. No shared processes or databases changed.
- TDD behavior RED: 5/5 regression assertions failed on deliberate stub; GREEN: 5/5 parser/sort and 3/3 server-rendered owner UI tests passed.
- Added strict UUID/ISO timestamp/integer/duplicate validation, exact cross-multiplication for change sort, zero-baseline unknown ordering, bounded repeated query normalization, authenticated fail-closed retry, and private robots metadata. Existing Nest owner API and PostgreSQL SECURITY DEFINER read unchanged.
- Mid-run origin/main re-fetched: unchanged `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`.

## Finished
Pending.
