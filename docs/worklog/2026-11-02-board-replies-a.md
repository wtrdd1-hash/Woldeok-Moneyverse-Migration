# Development A — Public Board Replies Filter (2026-11-02)

## Before work
- **State:** IN PROGRESS; isolated `auto/hourly-a-20261102-0025-board-replies` worktree created from latest `origin/main` `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.
- Reviewed `AGENTS.md`, `README.md`, English/Korean integrated plans, QA, recent development A/B/C PRs and the public board's source. English is canonical, Korean secondary.
- **Scope:** add an opt-in `replied=1` filter for posts with at least one public reply, within the **latest 50 publicly visible posts**; preserve existing stock/title filters and all unfiltered behavior. Never imply a full-archive search.
- **Design:** backend validates the single exact query value and filters within the already-bounded PostgreSQL `SECURITY DEFINER` result; web exposes a labelled checkbox; Android gateway rejects duplicate/invalid parameters and unverified success-shaped results. No new DB function/grants/migration, no financial writes.
- **Safety:** no modifications to main, existing branches, database schema, Test or Production. Existing P0 #993 and release provenance #1984 remain blockers.
- **TDD plan:** RED tests for controller, repository SQL, web parser and Android fail-closed response; GREEN implementation; full local gates and read-only real PostgreSQL check; record final exact SHA and release HOLD.

## In progress
- [x] RED: backend 2 failed/20 passed, frontend 9 failed; captured logs.
- [x] Backend controller validates exact replied=1; SQL parameterized on bounded SECURITY DEFINER result.
- [x] Frontend checkbox, noindex, verified empty/unavailable distinction and 50-row scope.
- [x] Android gateway rejects malformed/duplicate and unverified 200; 19 frontend target tests pass.
- [ ] Midpoint main rechecked `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; full exact-SHA gates pending.

## Midpoint checkpoint
- Start audit: 158 remote branches including main, 141 open PRs, mergeability API reported 1 conflicting (many UNKNOWN). No branch deletion.
- RED -> GREEN: Backend 22/22 targeted PASS; Frontend+Android 19/19 targeted PASS. Full typecheck PASS; changed-file lint PASS.
- Worktree remains isolated; no migration, grant, finance mutation or production action.

## Finished
- PENDING. No merge/deployment authorized without all gates.
