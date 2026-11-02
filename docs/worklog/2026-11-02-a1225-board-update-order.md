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
