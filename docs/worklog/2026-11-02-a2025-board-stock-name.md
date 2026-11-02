# A 2026-11-02 20:25 KST — Public Board Stock-Name Discovery (P1, Draft/HOLD)

## Before work — IN PROGRESS
- Start from current `origin/main` SHA `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`, separate `auto/hourly-a-20261102-2025-board-stock-name` worktree.
- Read AGENTS.md, README.md, English/Korean living plans and integrated master; review earlier QA, development A/B/C PRs, CI and open branches. Avoid duplicate #2411 (unanswered) and #2519 (author proof); new feature is bounded **stock-name** discovery, distinct from symbol search.
- Source is `public.member_board_public_list_with_stock(50)` (already exposes `stock_name`). Never broaden to historical archive, add table GRANT or modify applied migration/ledger.
- Plan: RED tests for strict `stockName` query, parameterized PostgreSQL source, Next accessible UI, Android app-api source proof + malformed/duplicate rejection; GREEN implementation; review; exact-SHA gates; release HOLD unless all gates pass.
- Work only in this branch. Preserve other agents' unique commits. No Test/Production mutation without independent release gates.

## During work — PENDING
- Record RED/GREEN, changed files, intermediate main SHA, and validation evidence.

## Finish — PENDING
- Record final SHA, gates, official Test/Production, rollback, PR and branch disposition.
