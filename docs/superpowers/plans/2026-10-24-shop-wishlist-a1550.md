# Shop Wishlist P1 — Implementation Plan (2026-10-24)

## Problem and chosen design
The Store 2.0 catalogue has no owner-specific save list. A member should save/remove a product without buying it, see saved products and remove withdrawn products. Guest visitors must not see a fabricated save. This follows F675-111 integrated planning; scope is a bounded first-page v1 (50 items), not full cursor/receipt/CAS follow-up.

## Safety and release boundaries
Feature disabled by default via SHOP_WISHLIST_ENABLED; disabled endpoints return 503 and UI is absent. DB SECURITY DEFINER functions validate active owner, serialize mutation by locking owner row, never grant app table DML, no ledger mutation. A 280 migration conflicts with pending B/A migrations and must remain Draft until resolved. No production DB writes, no applied migration editing.

## Tasks and RED/GREEN
1. Write backend repository and controller failing tests: authenticated actor binding, invalid IDs, no-store, disabled feature; implement SQL-only repository and guarded endpoints.
2. Write frontend gateway and view tests failing on absent wishlist helpers; implement private no-store API route and save/remove buttons, disabled by default, truthful server confirmation.
3. Add additive migration and isolated PostgreSQL tests for owner-only list, save/remove replay, 50 cap, withdrawn REMOVE, no app DML, rollback. Avoid live DB.
4. Run focused and full gates, inspect main/PRs again, document failures, create Draft PR only. No merge or production deploy without exact SHA full PASS.
