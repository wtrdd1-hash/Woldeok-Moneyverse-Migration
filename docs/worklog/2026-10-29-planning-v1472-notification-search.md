# Planning v1472 — F675-174 verified member notification search and stable history

**Date:** 2026-10-29 KST. **Cycle:** Previous Improvement v1470 / Current Addition v1472 / Next Improvement v1474 (provisional). **Status:** DOCUMENTATION DRAFT / RELEASE HOLD.

**Evidence:** Debian 13 miniPC healthy services; authoritative main `69c486777d023ee45a216528e7a0c8b7dd1d7ea7` at start/mid. Read `AGENTS.md`, `README.md`, canonical English `PROJECT_PLAN.md`, Korean parity and notification frontend/backend/DTO, app-api docs and real DEV PostgreSQL. Existing inbox is category/unread/offset, not keyword/date/keyset. DEV notifications 0 rows; pg_trgm absent; schema provenance unresolved. Latest completed QA v1371 FAILED/P0; v1372 not final. Concurrent Draft #1885 migration repair, #1883 QA lint and #1886 backend are owned by A/QA/B; no edits to those branches.

**Decision:** Add F675-174 member-only read-only search with safe POST JSON, 90-day bounded period, Korean-aware verified index gate, HMAC 10-minute keyset cursor, Next/Nest/Android parity, privacy/a11y/admin/SEO/KPI/rollback. All detailed acceptance and P0/P1 backlog in existing bilingual integrated master; no new standalone planning spec. [Development issue #1887](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1887).

**Release:** Four P0 gates (historic refs, migration checksum/lineage, finance provenance, QA exact-SHA/restore) and six P1 feature tasks. 10,001 synthetic data and attack cases are planned NOT executed. Feature OFF; no runtime, DB, WLD, Test or Production changes. External independent evidence new approved 0; cumulative deduplicated approved UNKNOWN/10,000 = BLOCKED/IN PROGRESS.

**Draft PR:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1888 — open, not merged, no runtime/Production promotion.
