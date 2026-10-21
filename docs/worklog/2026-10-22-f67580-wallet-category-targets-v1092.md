# F675-80 WLD category targets — v1092 (DRAFT)

Cycle: Previous Feature Improvement v1090; Current Feature Addition v1092; Next Feature Improvement. Source main a7dcfd05738146c5ece87c38eda4f60efe50127c. QA v1091 FAILED. No runtime, DB, Test or Production changes.

Evidence: `/wallet/activity` uses `/api/v1/wallet?recent=50`, not lifetime history; CSV exports only loaded transactions. DEV ledger 851 transactions / 1732 postings; annotation, classification-rule and category-budget tables absent. Core ledger postings are BIGINT; exact API decimal strings required. F675-78 and F675-79 are unimplemented dependencies.

Proposal: private, opt-in monthly fictional WLD category targets. Use owner-scoped ledger postings; exclude cash/bank internal transfers and loan principal, distinguish refunds/reversals, require manual category > automatic rule > uncategorized. Display READY only with full cursor, owner proof, classification provenance and reconciliation; otherwise PARTIAL/STALE/UNVERIFIED. No false complete budget, no WLD writes.

P0: truthful 50-row/CSV scope, ledger pocket deltas and precision, prior feature dependencies, v1091 financial ACL/CI/Test blockers. P1: owner-scoped SECURITY DEFINER budget settings and receipt functions; version CAS/idempotency; backend/BFF/App API; UI/administrator privacy/a11y/SEO/KPI; concurrency, month-boundary, IDOR, refund, 50/51/250/10001 rows and rollback tests. All untested. OFF by default; exact-SHA Test and signed-in E2E required before promotion.

Official reference publishers examined: YNAB, Monarch Money, Actual Budget. New approved external ledger records: 0; deduplicated 10,000 target remains BLOCKED, cumulative approved unknown. English canonical and Korean parity updates pending.
