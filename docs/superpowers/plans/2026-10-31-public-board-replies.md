# Public board reply-presence filter — implementation plan (2026-10-31)

## Scope and design
- Add an optional `replies=with|without` filter to `GET /api/v1/board/public/stock-posts` and the `/board` search form; default remains all. Explicitly filter only the 50 most recent **published** rows returned by `public.member_board_public_list_with_stock(50)`. The SQL `WHERE` is after this bounded function, not an unbounded archive search.
- Validate duplicate, malformed and unexpected query parameters before database access; preserve `stock` and `q` semantics.
- Query uses the existing `comment_count` returned by the definer function, no new migration or direct table grant. `with` requires count > 0; `without` count = 0. Existing normalization must reject invalid counts.
- Native Android `/app-api/v1/board/public/stock-posts` must forward the filter and reject a successful but unverified filtered response; public cache rules stay as before. Search-result pages must be noindex; default canonical remains unchanged.
- Accessibility: native select with label and 44px minimum touch target, clear scope text, errors and empty state.
- No changes to ledger, authentication, idempotency, or applied migrations.

## TDD tasks
1. Add backend tests: existing 50-row SQL function retained, `comment_count` predicate and argument bound, invalid/duplicate filter rejected without DB query, other filters combine.
2. Add frontend parser and form tests for `replies` default/valid/invalid and noindex.
3. Add Android gateway tests for forwarding, duplicate/invalid rejection and forged successful response.
4. Run RED tests, record failure evidence. Implement minimal controller/service/page/gateway changes; run GREEN.
5. Recheck latest main and English/Korean plan mid-work and pre-integration. Run full build/lint/typecheck/unit/integration/real PG/security/accessibility/SEO/app-api/E2E as available, record skipped and blocked separately.
6. Create Draft PR only; merge and release are forbidden without exact SHA Test/rollback and all mandatory green gates.
