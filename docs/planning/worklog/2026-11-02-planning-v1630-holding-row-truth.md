# Planning v1630 — F675-213 Holding-Row and Expiry Restamp Truth

**Date:** 2026-11-02 KST. **Cycle:** Previous Feature Addition v1628 → Current Feature Improvement v1630 → Next Feature Addition v1632 (provisional).
**Status:** DOCUMENTATION CANDIDATE / DRAFT / RELEASE HOLD. **Main start/mid:** 510dbe6bf4d5c2a8089fc06b480776053da7a2e3. **Stack base:** unmerged Draft #2410 (v1628 head c9bb5d4f30a8ef25d2c88079344c2432fa3fae60). **Developer handoff:** #2409.

**Fresh tests:** standard 171/171 PASS; classifier 24/24 PASS; expanded 175/176 (obsolete destructive-cleanup assertion FAIL); feature acceptance NOT RUN.

## Source-backed correction
- miniPC Debian 13 services and DEV PostgreSQL connected; Superpowers installed using-superpowers/brainstorming/worktree/writing-plans/verification inspected. skills__list had zero URIs, so skills__read route BLOCKED; installed skill files used.
- Source migration 071 PK(user_id,catalog_id), quantity>=0; migration 104 trigger restamps entire timed holding on quantity increase, not decrease; migrations 072/165 upsert into same row. Read-only DEV confirms PK and only existing user_items_pkey/equipped indexes. DEV 6 positive rows, zero timed/72h candidates. No Production data inferred.
- Corrected v1628 fictional duplicate lots/grouping: proposed owner-only current 24/72h **catalog holding-row** snapshot, totalCatalogHoldings exact COUNT, totalUnits exact SUM, <=10 unique catalog rows, hasMore iff COUNT>10; explain purchase may reset entire holding expiry. Single DB asOf, no client UUID, 503 unverified, no 304, no direct app-role grants, no WLD/ledger/item write.
- P0 OPS1630-01 SEC1630-02 FIN1630-03 REL1630-04 and P1 ROW1630-05..ROW1630-10, official exact-SHA Test and restore HOLD. External new approved 0; cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS.
- Main and canonical English/Korean plans rechecked at midpoint. No runtime, DB, item, WLD, Test or Production mutation. Tests/PR/CI recorded only after actual verification.
