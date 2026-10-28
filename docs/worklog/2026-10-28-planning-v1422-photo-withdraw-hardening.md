# Planning v1422 — F675-161 Photo Withdrawal Integrity

**Status:** PARTIAL / DRAFT / RELEASE HOLD. Previous Addition v1420 → Current Improvement v1422 → Next Addition v1424 provisional. Main 35971c600f25869c96f1c666d4b9f58927202730 checked at start/mid. Predecessor Draft #1727; development candidate Draft #1730; QA v1346 FAILED.

**Evidence:** Current main lacks withdrawal. Candidate SQL migration 292 deletes photo rows, retains independent tombstone and quota, but GET mine only lists surviving 30 photos. Owner-visible withdrawn receipt/history and pagination are absent. Proposed and actual endpoint/response differ. Active-user and dedicated OFF gate absent in SQL; per-render UUID retry instability; mobile contract lacks withdrawal. SQL tests can be skipped without DB env. These are candidate review findings, not confirmed live defects or proven exploits.

**Decision:** Harden existing integrated EN/KO planning and 10-ID P0/P1 backlog; preserve both possible storage models until development owner chooses an audited model, then require durable redacted owner receipt, publish/media fences, 5/day quota, typed web/Android contract, stable retries, isolated real-PG tests, exact-SHA Test, restore and OFF rollback. No new standalone feature spec or runtime edits. Finance historical 18k WLD divergence, 97% disk and backup incident #1718 remain release blockers.

**External evidence:** 3 official publisher families reviewed (PostgreSQL/OWASP/W3C), 0 newly accepted deduplicated records; cumulative accepted UNKNOWN/10,000; gate BLOCKED / IN PROGRESS. No Production or Test code, DB, WLD, media or feature-switch mutations.

**Handoff:** https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1726 and https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1730.
