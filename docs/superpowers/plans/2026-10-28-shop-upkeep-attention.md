# Member shop holdings attention filter — A 2026-10-28 05:25

## Scope and decision
Member-owned shop holdings already come from the owner-scoped PostgreSQL `shop_my_items_v2(actor)` function. The existing shelf displays all items but has no quick way to locate overdue maintenance/suspended holdings. Add a read-only `status=attention` query, with no new table, migration, WLD movement or side effects. Existing settlement buttons remain the only write entry point. The feature is a bounded P1 UX improvement, not a claim that the wider project is releasable.

## Tasks (test first)
1. `backend/src/shop/shop-holdings-filter.test.ts` RED: reject unsupported statuses, return only arrears/unpaid/suspended rows, preserve 64-bit string values and zero/empty; GREEN implement `shop-holdings-filter.ts` and wire guarded `GET shop/holdings` controller, no-store response.
2. `frontend/src/app/shop/catalog/holdings-filter.test.ts` RED: preserve catalog search query while switching member shelf status; GREEN implement URL builder and status-specific `GET shop/holdings`, accessible controls and accurate empty state in `page.tsx`.
3. `frontend/src/app/app-api/v1/[...path]/route.test.ts` RED: Android forwards `status=attention`, rejects upstream public caching, and never caches gateway errors; GREEN add narrow private shop holdings response fence and safe gateway error caching.
4. Run backend/frontend focus tests, lint/typecheck/build, full unit/integration, real isolated PostgreSQL owner-function read/ACL, app-api contract, security, accessibility/SEO review, official Test exact-SHA gate. Recheck main/plan before integration; no merge or Production without PASS.

## Risks and rollback
Never treat a failed owner read as an empty shelf; never convert arrears to JavaScript Number; no client-supplied actor; `status=all` remains backward compatible. Rollback removes only the optional filter; DB and ledger unchanged. Preserve all other workers' branches and worktrees.
