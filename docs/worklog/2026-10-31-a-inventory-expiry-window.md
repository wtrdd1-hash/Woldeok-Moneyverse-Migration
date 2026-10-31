# Development A — Member Inventory Expiry Window (2026-10-31)

## BEFORE WORK — v1
- Main at start: `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`; remote branches 134; open PRs 118. Worktree `auto/hourly-a-20261031-2225-inventory-expiry-window` isolated from B/C/Gemini and integration PR #2206.
- Source: AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md (English canonical), F675-199 draft PR #2212, earlier QA and A PR #2210 reviewed. This is a bounded owner inventory **rolling 7/30-day expiry filter**, not the unimplemented F675-199 calendar. No new migration, grants, WLD or ledger writes.
- Design: extend existing owner-scoped `shop_my_items_v2` SQL read with a parameterized expiry predicate before returning rows; validate enum at Nest; Next SSR keeps the full holdings for equipped showcase and obtains a separate filtered list; Android gateway validates filter, verified JSON and private headers. Unknown/error is never shown as verified empty. Default remains unchanged. Rolling days use DB time, not KST calendar dates.
- TDD plan: (1) write failing controller/Android/selection tests; (2) implement SQL/controller/Next/app-api; (3) rerun targeted and full quality gates, isolated PostgreSQL, exact-SHA CI, release checks; (4) record PASS/BLOCKED and keep Draft until all gates pass.
- Safety: read-only, no new SQL migration, no direct table grants; preserve all open PRs and unique branches. Rollback: revert this PR; default owner inventory remains unchanged.

## IN PROGRESS — v2
- Awaiting RED/GREEN evidence and latest main recheck.

## FINISHED — v3 (code complete, release HOLD)
- Backend full 2,787 PASS / 501 SKIP; frontend full 2,781 PASS; targeted tests 3+5 PASS; contract build, typecheck, backend/frontend production builds PASS; targeted lint 0 errors/10 warnings. Real DEV PG read-only SQL executes; synthetic 7d=1/30d=2. No official Test candidate authenticated E2E.
- Code SHA CI failed due generated mobile contract/schema drift; generated 184-endpoint English/Korean docs included in final commit. Final exact SHA CI and image require separate verification.
- Remote branches 134 at start, 135 at final audit; open PRs 118 -> 120; 8 conflicting. No branch deleted (unique unmerged changes protected); no main merge.
- DEV P0 app-role user_items direct SELECT/DELETE true, official Test auth E2E, independent restore, financial provenance and GitOps remain blockers. No Test/Production deploy, service restart, DB mutation or rollback. Revert PR for rollback.
- QA/release evidence: docs/qa/2026-10-31-a-inventory-expiry-window[.ko].md and docs/releases/2026-10-31-a-inventory-expiry-hold[.ko].md; host logs in /srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-2225-inventory-expiry/.

### MIDPOINT v2 — 22:28 KST
- TDD RED: Backend controller 1 FAIL/2 PASS; frontend Android/expiry 2 FAIL/3 PASS. GREEN: Backend 3/3 and frontend 5/5 PASS. Contract build, backend and frontend typecheck PASS. Main rechecked unchanged `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`.
- Implemented parameterized owner SECURITY DEFINER expiry predicate (7/30 rolling days, database transaction clock), strict Nest query, Next SSR filter + verified-empty/unavailable and all-holdings equipped showcase, Android fail-closed proof and private/noindex/no-referrer. No migration/ledger writes.
- DEV PostgreSQL 17.11 role audit: `shop_my_items_v2` SECURITY DEFINER and app EXECUTE=true, but direct `public.user_items` SELECT=true and DELETE=true (P0 #993 persists; DEV-only observation). No Production conclusion.
- Integration and deployment remain HOLD pending full gates, exact-SHA CI, official Test auth/E2E, independent restore, P0 ACL and release provenance.
