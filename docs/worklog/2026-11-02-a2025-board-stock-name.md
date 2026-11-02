# A 2026-11-02 20:25 KST — Public Board Stock-Name Discovery (P1, Draft/HOLD)

## Before work — IN PROGRESS
- Start from current `origin/main` SHA `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`, separate `auto/hourly-a-20261102-2025-board-stock-name` worktree.
- Read AGENTS.md, README.md, English/Korean living plans and integrated master; review earlier QA, development A/B/C PRs, CI and open branches. Avoid duplicate #2411 (unanswered) and #2519 (author proof); new feature is bounded **stock-name** discovery, distinct from symbol search.
- Source is `public.member_board_public_list_with_stock(50)` (already exposes `stock_name`). Never broaden to historical archive, add table GRANT or modify applied migration/ledger.
- Plan: RED tests for strict `stockName` query, parameterized PostgreSQL source, Next accessible UI, Android app-api source proof + malformed/duplicate rejection; GREEN implementation; review; exact-SHA gates; release HOLD unless all gates pass.
- Work only in this branch. Preserve other agents' unique commits. No Test/Production mutation without independent release gates.

## During work — CODE COMPLETE / GATES IN PROGRESS
- RED: new Nest/service/SSR/Android tests failed on absent stockName support; evidence in task `evidence/red-{backend,frontend}.log`.
- GREEN: targeted Nest service/controller/HTTP 31 PASS; SSR/Android 9 PASS. The first Android HEAD test used a GET request fixture and was corrected to a real HEAD request; a malformed test-parenthesis regression was fixed before rerun.
- Existing `member_board_public_list_with_stock(50)` is queried with parameterized `strpos(lower(stock_name), lower($4::text)) > 0`; no new migration or privilege.
- Real development PostgreSQL 17.11: read-only transaction as `moneyverse_app` EXECUTE succeeded, 1 public row and 0 stockName='제주' matches. DEV ACL remains unsafe (`user_items` DELETE and `account_balances` UPDATE both true); Production ACL not checked.
- Android requires explicit `stockNameFilter` + `sourceWindow:50`, validates rows and UUIDs, rejects legacy empty 200 and filtered HEAD; Next SSR uses same verifier and non-indexable filtered metadata.
- Contract generated for all 184 endpoints. `pnpm typecheck` PASS. `api:contract:check` detects expected uncommitted generated contract drift; re-run after code commit.
- Re-fetched `origin/main` at midpoint: `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b` (unchanged). Other A/B/C branches and Draft PRs left untouched.

## Finish — PENDING
- Record final SHA, gates, official Test/Production, rollback, PR and branch disposition.
