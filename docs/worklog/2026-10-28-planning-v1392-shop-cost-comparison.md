# Planning v1392 — F675-154 Verified Read-only Shop Cost Comparison (2026-10-28)
**Status:** DRAFT / RELEASE HOLD. Previous Improvement v1390 → Current Addition v1392 → Next Improvement v1394 (provisional).

**Source inspection:** main AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md (English canonical) and PROJECT_PLAN.ko.md read; main b1cd54fda1123fb07ca81b6e5b3ead70f59f556c re-fetched at start and midpoint. Real member shop page/catalog models, NestJS controller/repository and migration 165 examined. Existing member shop shows item price and upkeep, not a 2–3-item comparison. SQL `shop_catalog_list_v2(actor)` exposes current actor-dependent price, quantity, weekly upkeep and sale boundary; no quote guarantee. Distinguish code-observed gap from unproven incidents.

**Product:** session/consent-gated comparison of 2–3 distinct catalog UUIDs and illustrative 0/1/4-week upkeep; read-only single statement; no persisted selection, stock hold, purchase, WLD debit, ledger or outbox. API, UI, CTA, states, security, mobile BFF, SEO, accessibility, privacy, admin aggregates, KPI and release rollback specified in integrated EN/KO master.

**Backlog:** P0 ENV1392-01 SEC1392-02 REL1392-03 SHOP1392-04; P1 SHOP1392-05 SHOP1392-06 SHOP1392-07 SHOP1392-08 SHOP1392-09 SHOP1392-10. QA v1331 root test/lint/audit FAIL, build PASS, 235/241 DEV app-role DML, five applied checksum mismatches, missing release symlink targets. Exact-SHA official Test and independent backup restore not verified. Synthetic 10,001/100 concurrent/100 forged planned, NOT RUN. External new approved 0; cumulative independently dedup approved UNKNOWN/10,000 = BLOCKED / IN PROGRESS.

**Isolation:** documentation-only branch/worktree stacked on unmerged v1390 PR #1624; no overlap with Gemini/A/B/C/QA and no direct runtime, DB, finance, Test, Production or automation changes. GitHub PR/issue details recorded in external completion log after creation.

**GitHub:** Draft PR #1630 (base #1624); development issue #1629; independent merge prohibited.
