# Member shop in-stock filter implementation plan

> For agentic workers: follow test-driven-development, verification-before-completion and isolated worktree discipline.

## Design / scope

The member catalogue currently groups items and searches text but cannot exclude sold-out items. Add an optional `stock=available` read-only filter on the existing authenticated catalogue endpoint. It means **positive or unlimited listed stock**, NOT a purchase guarantee: the database still revalidates stock, account purchase limits, prices and discounts at purchase. Invalid/multi-valued stock filters fail HTTP 400 before a database read. Reuse the existing owner-scoped `shop_catalog_list_v2(actor)` function; no table grants, migration, WLD transaction or new data store. Web has an accessible checkbox preserving text search; Android forwards the same query and fences private cache. No anonymous member catalogue.

## Tasks

- [x] RED: add backend stock filter tests (unlimited, zero, positive, invalid arrays) and run to confirm failure.
- [x] GREEN: implement backend `stock=available` validation and filter after existing owner-scoped SQL projection.
- [x] RED: add web catalogue URL tests and Android query/cache tests; run to confirm failure.
- [x] GREEN: add web checkbox, API query and Android private/no-store/noindex cache fence.
- [x] Run focused and full lint/typecheck/unit/integration/build/app-api/security and read-only real PostgreSQL function/ACL checks.
- [x] Re-fetch latest main and planning before PR; keep Draft/HOLD unless exact-SHA CI and official Test/release gates pass. Record rollback (non-deployed code revert) and preserve every unmerged branch.

**Gate qualification:** Full suite PASS with documented DB skips; official exact-SHA authenticated Test E2E and Production release remain BLOCKED. No merge or deploy.
