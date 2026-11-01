# A 2026-11-02 04:25 — Public stock-discussion self-disclosure filter

## Before work (04:25 KST)
- Task: P1 read-only end-to-end filter for **self-reported** position disclosure on recent public stock discussions; not verification of actual stock holdings.
- Branch `auto/hourly-a-20261102-0425-board-disclosure`, separate worktree from `origin/main` `a8541927c3a351d980454c66e95a3356c47e0722`.
- Read `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md` (English canonical), `PROJECT_PLAN.ko.md` (translation), latest QA and open PR/CI. Existing B #2419 owns ACL P0, C #2424 owns admin analytics; do not overlap.
- Start: 179 remote branches including main; 165 remote-tracking branches not merged; 162 open PRs, 29 conflicting. All unique branches preserved.
- Design assumption: filter the existing PostgreSQL `member_board_public_list_with_stock(50)` snapshot with a parameterized `position_disclosure` predicate; no new table/migration/ledger change. Accepted values: `holder`, `no_position`, `operator_related`, `undisclosed`. Exclude untagged posts when filter is active. Labels explicitly indicate self-report, never confirmed ownership. Allow combining `stock` and `q`.
- Contract: backend validates query and echoes applied filter; web exposes accessible select and noindex; Android app-api rejects malformed, duplicate or unsupported filter requests and fails closed on unverified successful responses. Strict max 50 and no-store/noindex for filtered responses. Preserve default behavior.
- Plan: (1) write red tests for backend service/controller; (2) SQL and controller; (3) web filter and tests; (4) Android gateway fail-closed and tests; (5) full gates, real PostgreSQL read-only probe, CI/PR, release HOLD if any gate unverified.
- Safety: `moneyverse_app` may only execute existing read functions; never grant table privileges or modify immutable applied migrations; no money writes; Test/Production release blocked unless exact SHA and independent restore pass.

## In progress
- Pending tests and implementation. Follow TDD RED→GREEN; re-fetch `origin/main` mid-work and before integration.

## Finished
- Pending exact SHA, gates, Test/Production/rollback and branch preservation decision.
