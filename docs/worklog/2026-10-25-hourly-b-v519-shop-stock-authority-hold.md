# Moneyverse Development B v519 — shop stock authority containment
Date: 2026-10-25 01:36–01:53 KST. **PARTIAL / RELEASE HOLD**.

## Provenance
- Initial and mid-run `origin/main`: `c9a868b1e622341e2daa8b936ddf0988eda9988e`; independently checked via `git ls-remote` twice.
- Independent worktree: `/srv/moneyverse-data/build-workspaces/mv-b-v519-20261025-0135`; branch `auto/hourly-b-shop-stock-authority-hold-v519-20261025-0135`.
- Read full AGENTS.md, README.md, English and Korean living plans. Current planning v1242 (Draft #1200), QA v1243 HOLD, latest open PRs including A #1201, C #1202, B #1196; no overlapping implementation in this branch. No other worktree modified.
- P0 source mismatch: migration 168 updates `shop_catalog.current_stock`, but shop availability and purchase use `shop_inventory.quantity` (migration 165 / 215). A catalog-only stock edit is not an authoritative restock. No claim of observed member losses.

## Actual code
1. Backend `PATCH /api/v1/admin/shop/items/:id` now returns 503 `SHOP_STOCK_AUTHORITY_UNVERIFIED` **before any database query** if `current_stock` is present, including null and zero; price and active updates remain permitted. Existing admin role/console/CSRF/recent reauthentication guards retained.
2. New same-origin Next gateway `PATCH /api/admin/shop/items/:id` with strict UUID and payload validation, server-side session-derived CSRF, no-store responses, and upstream status propagation. Blocks stock payloads independently before fetching session.
3. Admin shop desktop/mobile controls display catalog stock as **reference only**, remove editable stock inputs, and submit only price/active to the actual Next route. Removed misleading "live stock control" page description.
4. No DB schema, applied migration, ledger, member inventory, Test, or Production changes. Database function `admin_shop_update_item` remains capable of changing catalog stock when called outside this controller; a future forward-only PostgreSQL fix and app-role ACL tests are REQUIRED. This is temporary HTTP-path containment, not an authoritative DB solution.

## Verification evidence
- TDD RED: Backend stock test 3 failing, frontend UI 2 failing, gateway missing route RED, strict payload array RED.
- GREEN: Backend focused 5/5, Frontend focused 9/9 after final code.
- Backend full local 1317 PASS / 398 SKIPPED (DB-backed tests not executed). Database package 15 PASS / 3 SKIPPED.
- Frontend full local 1403 PASS / 6 FAIL (existing i18n/SEO/login/M2 failures; not a green gate).
- ESLint full exit 0 with existing warnings; changed-file ESLint exit 0. Backend and Frontend TypeScript checks PASS.
- Backend Nest build PASS; default Next Turbopack build FAIL because external `node_modules` symlink leaves filesystem root; alternative `next build --webpack` PASS before final gateway input-type refinement, repeated after the final gateway validation change: PASS.
- Mobile API contract 179 endpoints PASS.
- Production dependency audit FAIL: 2 High (`body-parser`, `multer`). Bot audit FAIL: 1 Critical, 5 High.
- No isolated real PostgreSQL integration or authenticated Test exact-SHA: BLOCKED; never use production-linked dev DB for fixtures.
- Disk preflight FAIL: miniPC root 100% (14–30 MiB available), separate data disk 40–41%. Archived 106 old GitHub CLI CI-log cache ZIPs (17 MiB) to data volume without deleting logs or worktrees. Capacity issue #1170 remains OPEN.

## Release gates
CI final SHA pending; merge NOT authorized; Test exact-SHA NOT run; GitOps release gate NOT PASS; Production HOLD. Draft PR only. Other A/C/QA/Planning/Gemini branches and scheduled automations untouched. No branch cleanup.

## Required follow-up
- Coordinate migration numbering (#1147) and implement a new immutable PostgreSQL migration that updates `shop_inventory.quantity` atomically with catalog and enforces app-role least privilege; audit every inventory writer and purchase/restock race.
- Validate signed-in admin price/status and stock-block HTTP 503, CSRF/reauth, member checkout, app API and 100 concurrent stock transitions on isolated real PostgreSQL and exact-SHA Test.
- Clear frontend six failing tests, dependency advisories, root capacity emergency, migration collisions, independent QA and GitOps release gates before any merge or Production promotion.
