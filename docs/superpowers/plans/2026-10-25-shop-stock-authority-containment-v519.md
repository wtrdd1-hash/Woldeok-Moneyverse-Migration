# Admin shop stock authority containment — implementation plan (v519)

> For agentic workers: use the test-driven-development and verification-before-completion skills. Release HOLD.

## Evidence and constraints
- main: `c9a868b1e622341e2daa8b936ddf0988eda9988e`, latest remote main verified 2026-10-25 01:36 KST.
- Planning v1242 identifies authoritative stock in `shop_inventory.quantity`, whereas `admin_shop_update_item` (migration 168) changes only `shop_catalog.current_stock`. Public shop reads/purchases use inventory; this is a verified cross-table contract mismatch, not evidence of real member harm.
- The admin UI always sends `current_stock`, even when an operator changes only price or active status. A backend-only stock block would accidentally disable unrelated updates. Fix both layers.
- No DB or migration edits. Do not change inventory or ledger. Do not touch other developers' worktrees, PRs or core automations.

## Task 1 — Backend fail-closed
1. Add a unit test for `AdminShopController.updateItem` that passes a stock change and asserts HTTP 503 without invoking the database. RED first.
2. Add a positive regression for price/active-only mutation and existing guard metadata.
3. Add `ServiceUnavailableException` before any SQL call whenever `current_stock` is present, including null/zero/same value; retain price and active paths. GREEN.

## Task 2 — Frontend truthful control
1. Add a component regression test that edits a product and checks that stock is not editable and that the PATCH body never includes `current_stock`. RED first.
2. Remove editable stock state/inputs in both mobile and desktop; keep a clearly marked non-authoritative catalogue stock reference with explicit HOLD messaging.
3. Add a same-origin Next PATCH gateway with strict payload/UUID validation and server-resolved session CSRF. Test stock and cross-origin rejection before any backend request (RED then GREEN).
4. Submit only `base_price` and `active` through this real gateway; update only these fields after HTTP success. GREEN.

## Task 3 — verification and handoff
1. Focused Backend/Frontend tests; lint/typecheck/build/full tests/DB integration and audits as feasible. Record failures accurately.
2. Re-fetch main and planning before finalizing, run GitHub CI for exact head SHA, create Draft PR with changed API contract and release HOLD.
3. No merge, no official Test promotion or Production deployment without all mandatory gates. Root filesystem was 100% full (23 MiB free); avoid cache writes there.
