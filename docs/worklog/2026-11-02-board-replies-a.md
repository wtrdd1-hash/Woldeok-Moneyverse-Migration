# Development A — Public Board Replies Filter (2026-11-02)

## Before work
- **State:** IN PROGRESS; isolated `auto/hourly-a-20261102-0025-board-replies` worktree created from latest `origin/main` `3d5e321c3d1221febff677469fecdfcb3cf42e7d`.
- Reviewed `AGENTS.md`, `README.md`, English/Korean integrated plans, QA, recent development A/B/C PRs and the public board's source. English is canonical, Korean secondary.
- **Scope:** add an opt-in `replied=1` filter for posts with at least one public reply, within the **latest 50 publicly visible posts**; preserve existing stock/title filters and all unfiltered behavior. Never imply a full-archive search.
- **Design:** backend validates the single exact query value and filters within the already-bounded PostgreSQL `SECURITY DEFINER` result; web exposes a labelled checkbox; Android gateway rejects duplicate/invalid parameters and unverified success-shaped results. No new DB function/grants/migration, no financial writes.
- **Safety:** no modifications to main, existing branches, database schema, Test or Production. Existing P0 #993 and release provenance #1984 remain blockers.
- **TDD plan:** RED tests for controller, repository SQL, web parser and Android fail-closed response; GREEN implementation; full local gates and read-only real PostgreSQL check; record final exact SHA and release HOLD.

## In progress
- [ ] Tests fail for missing filter.
- [ ] Backend + SQL source filter.
- [ ] Frontend labelled control and empty/error states.
- [ ] Android app-api fail-closed contract and tests.
- [ ] Recheck main and run exact-SHA required gates.

## Finished
- PENDING. No merge/deployment authorized without all gates.
