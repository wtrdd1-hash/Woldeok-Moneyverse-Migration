# Planning v1242 — F675-117 stock authority and notice-race hardening / 재입고 재고 권위·알림 무결성
2026-10-25 KST. Previous Feature Addition v1240 → Current Feature Improvement v1242 → Next Feature Addition v1244 (provisional).
Baseline main: c9a868b1e622341e2daa8b936ddf0988eda9988e. Predecessor Draft #1195 is unmerged; this documentation branch is based on its head. No overlap with Gemini/A/B/C/QA changes.

## Verified code / 코드 검증
- Migration 168 admin_shop_update_item updates shop_catalog.current_stock; admin_shop_items and admin controller use this legacy field.
- Migration 165 shop_catalog_list_v2 and shop_purchase_catalog_policy_v215 use shop_inventory.quantity for visible and purchasable stock; migration 218 wraps purchase; migration 092 auto policy also updates inventory quantity.
- Therefore an admin catalogue-only stock change cannot prove a purchasable restock. This is a source-code contract mismatch, NOT a demonstrated production incident.
- Root filesystem 99% full (1.1GB free) at start; isolated worktree on /srv/moneyverse-data. Latest verified QA v1243 FAILED/HOLD.
- Existing notification module must be inspected before binding notice receipts; no fabricated notification table or claimed delivery.

## P0/P1 backlog / 우선순위
P0: ENV1242-01, SEC1242-02, REL1242-03, SHOP1242-04.
P1: SHOP1242-05, SHOP1242-06, SHOP1242-07, SHOP1242-08, SHOP1242-09, SHOP1242-10.
Canonical EN/KO full design: docs/planning/INTEGRATED_PLANNING_MASTER.md and .ko.md; summaries in PROJECT_PLAN EN/KO and feature review EN/KO.
Proposed: audit and migrate admin stock authority, no silent catalogue backfill, inventory 0→positive event in the same transaction, event provenance/epoch, short locked current-stock + consent/cancel check, atomic in-app receipt and 100-way race/rollback tests. No implementation/tests executed in planning.

## Release and evidence gates / 배포·근거 게이트
Shared Production/dev DB and wildcard 5433, excessive app DML/PUBLIC bank EXECUTE, migration266/280, dependency/frontend/bot audit, root disk 99%, exact-SHA official Test and isolated restore remain BLOCKED. Feature OFF, separate engineering branch, TDD, exact-SHA Test, finance/ACL/Android E2E, reviewed GitOps and zero-downtime rollback required.
Independent external evidence: PostgreSQL, OWASP, W3C previously reviewed publisher families 3; newly deduplicated/approved 0, cumulative verified UNKNOWN/10,000 = BLOCKED/IN PROGRESS. No runtime/DB/WLD/Test/Production changes.
