# Public board discussion category filter — implementation plan

**Design assumption (noninteractive hourly run):** A member/visitor may filter only the **50 latest public posts** by the existing stock-tag category. Values: analysis, question, journal, business, system. Untagged posts are excluded when a category is chosen. Stock and title filters remain composable; no claim of global search. No data writes or schema changes.

1. RED: Add controller/service tests in `backend/src/board/stock-community.http.test.ts` and `stock-community.service.test.ts` for allowlisted category, duplicate/unknown input, bounded function call and SQL filter.
2. GREEN: Update `PublicStockCommunityController.list()` and `StockCommunityService.publicList()` with optional category, query after the `member_board_public_list_with_stock(50)` function; no direct table grants.
3. RED: Add frontend page tests for category selection and noindex; Android gateway tests for category validation, response proof and cache headers.
4. GREEN: Update `frontend/src/app/board/page.tsx` and `frontend/src/app/app-api/v1/[...path]/route.ts`; fail closed if an Android upstream ignores category.
5. Verify targeted tests, typecheck, lint, build, DB read-only function execution and existing security/app API contracts; record full gates separately, no fabricated PASS.
6. Re-fetch origin/main and planning before PR; only merge on exact SHA CI + isolated Test auth E2E + release gates. Otherwise Draft HOLD. Rollback: remove category query; no schema/data rollback required.
