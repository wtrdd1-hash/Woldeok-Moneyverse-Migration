# Development A — 2026-11-02 12:25 KST — bounded public board update ordering

## Before work — v1
- Authority: `origin/main` `a8541927c3a351d980454c66e95a3356c47e0722`; read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and `.ko.md`, QA v1461, open PRs, CI and branch inventory.
- Isolated branch: `auto/hourly-a-20261102-1225-board-update-order`; source main untouched (its local `implementation_plan.md` is modified by another worker).
- Scope: Add an explicit latest-update/oldest-update ordering choice to the bounded public board list (not comment activity), across Nest HTTP, SQL over the existing PostgreSQL SECURITY DEFINER recent-50 function, Next web and Android app API. No new grants/migrations, ledger or financial changes.
- Alternative rejected: global board ordering would misrepresent the latest-50 snapshot; keep bounded semantics and source-based verification.
- TDD: fail tests before implementation. Validate strict duplicate query handling, deterministic timestamps/IDs, SEO and Android response checks. Release HOLD until exact-SHA Test, auth E2E, independent restore and P0 DB ACL gates pass.

## In progress — v2
- Pending implementation, tests and independent review.

## Finished — v3
- Pending evidence and final disposition.

### In progress — v2.1 (12:28 KST)
- TDD RED: Backend 3 failures / 17 passes; Frontend 8 failures, then default-select regression RED Backend 1 / Frontend 3.
- GREEN: Backend 20/20, Frontend 21/21 including title-search regression; backend/frontend typecheck passed before default-selector fix.
- Actual PostgreSQL 17.11: `SET LOCAL ROLE moneyverse_app` inside READ ONLY transaction; `member_board_public_list_with_stock(50)` executes, 1 public post, updated-order SQL executes, ROLLBACK. No DML or grant.
- Default form sends explicit `order=latest`; both HTTP and Android gateway accept it. Updated-order response requires server marker and chronological UUID/timestamp verification; unverifiable successful Android responses fail 503. Noindex/no-store for query-specific results.
- `origin/main` and both master plans rechecked; independent contributor changes untouched. Full tests/build/contract and exact-SHA official Test still pending.
