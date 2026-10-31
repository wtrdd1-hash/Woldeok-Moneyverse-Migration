# Development A — Member Inventory Expiry Window (2026-10-31)

## BEFORE WORK — v1
- Main at start: `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`; remote branches 134; open PRs 118. Worktree `auto/hourly-a-20261031-2225-inventory-expiry-window` isolated from B/C/Gemini and integration PR #2206.
- Source: AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md (English canonical), F675-199 draft PR #2212, earlier QA and A PR #2210 reviewed. This is a bounded owner inventory **rolling 7/30-day expiry filter**, not the unimplemented F675-199 calendar. No new migration, grants, WLD or ledger writes.
- Design: extend existing owner-scoped `shop_my_items_v2` SQL read with a parameterized expiry predicate before returning rows; validate enum at Nest; Next SSR keeps the full holdings for equipped showcase and obtains a separate filtered list; Android gateway validates filter, verified JSON and private headers. Unknown/error is never shown as verified empty. Default remains unchanged. Rolling days use DB time, not KST calendar dates.
- TDD plan: (1) write failing controller/Android/selection tests; (2) implement SQL/controller/Next/app-api; (3) rerun targeted and full quality gates, isolated PostgreSQL, exact-SHA CI, release checks; (4) record PASS/BLOCKED and keep Draft until all gates pass.
- Safety: read-only, no new SQL migration, no direct table grants; preserve all open PRs and unique branches. Rollback: revert this PR; default owner inventory remains unchanged.

## IN PROGRESS — v2
- Awaiting RED/GREEN evidence and latest main recheck.

## FINISHED — v3
- Pending exact-SHA gate evidence; no merge or deployment without required PASS.
