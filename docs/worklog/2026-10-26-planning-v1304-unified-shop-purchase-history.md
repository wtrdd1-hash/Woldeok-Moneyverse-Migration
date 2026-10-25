# Planning v1304 — F675-133 Unified Shop Purchase History (2026-10-26, DRAFT / RELEASE HOLD)
- v1304 engineering issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1389

**Cycle:** Previous Feature Improvement v1302; Current Feature Addition v1304; Next Feature Improvement v1306 provisional.

## Source and ownership
- Main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` verified start/mid; AGENTS.md, README.md and main EN/KO PROJECT_PLAN read. Predecessor planning Draft #1384 unmerged, new docs branch stacked; do not confuse draft plans with main.
- Debian 13.6, services active, PostgreSQL connected to `woldeok_moneyverse_dev` (not certified isolated), root 100% ~737MiB free; data volume ~45GiB. No cleanup, shared DB write or production operations.
- Main frontend shop page does not mount `MyReceipts`. The legacy receipt component and Next BFF falsely return empty on upstream failure. Backend GET /api/v1/shop/purchases calls `shop_list_my_purchases(actor,30)` (migration 009) only; migration 071/072 Store 2.0 has separate `shop_purchases` rows. Historical item name is not guaranteed immutable. Developer A's Draft #1258 covers legacy history only; coordinate without overlapping implementation.
- QA v1286 at 07:26 KST: typecheck/lint/build PASS; six frontend tests FAIL; production/full/bot dependency audits FAIL. Isolated authenticated Test exact-SHA, migration266/280 provenance, restore and Production release remain HOLD.
- Relevant skill files read from miniPC: using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion. `skills__list` returned no available URIs, so `skills__read` could not be invoked with a valid listed URI. Planning-only architectural design remains Draft for later human approval before runtime implementation.

## Deliverable and checks
- Canonical English and equivalent Korean integrated masters, PROJECT_PLAN and feature portfolio review, EN/KO update logs; this worklog is the sole new repo file. P0 four and P1 six engineering IDs: ENV1304-01, SEC1304-02, REL1304-03, SHP1304-04, SHP1304-05, SHP1304-06, SHP1304-07, SHP1304-08, SHP1304-09, SHP1304-10.
- User flow, owner-only read API, dual-source SECURITY DEFINER union, stable keyset, 15-minute signed cursor, precise amount semantics, admin anonymized metrics, Android, SEO, WCAG 2.2 AA, Test exact-SHA, feature-OFF rollback in integrated masters.
- External independent references reviewed (PostgreSQL transaction isolation, OWASP API object authorization, W3C WCAG 2.2): three publisher families, **zero** newly verified/approved deduplicated evidence records; cumulative accepted **UNKNOWN/10,000**, BLOCKED/IN PROGRESS. Review is not approval or acquisition of 10,000 records.
- No runtime, database, WLD, ledger, Test, Production or feature switch changes. No merge or deployment; draft PR only.
