# Planning v1288 — Verified Member Shop Wishlist — 2026-10-26
- **GitHub planning review:** [Draft PR #1345](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1345) (stacked on unmerged #1340, review-only); [development issue #1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344).

- **Cycle:** Previous Feature Improvement v1286 / Current Feature Addition v1288 / Next Feature Improvement v1290 provisional.
- **Authority:** remote main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` checked start/mid; AGENTS.md, README.md, canonical PROJECT_PLAN.md, Korean parity. Planning stacked on unmerged Draft #1340; engineering [#1344](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1344). No overlap with Development A/B/C, Gemini or QA branches.
- **Evidence:** Debian 13.6 miniPC and dev DB connected; root 98% (~2.1GiB free), data volume ~65GiB free. Source frontend shop page/store view, Nest shop controller/repository, migrations 071/075; no member wishlist CRUD on checked main. No claim of Production defect. v1278 raw QA 1397 pass/6 fail and timeout, audits fail; no final QA approval.
- **Deliverable:** F675-129 owner-only 30-item verified wishlist, real catalog UUID, exact BIGINT string price, live availability, idempotent owner CRUD, immutable receipt, quota/revision transaction, explicit merge/erase, admin privacy, SEO/mobile/a11y/KPI, staged default OFF and rollback. Detailed P0/P1 backlog in EN/KO integrated master.
- **P0:** ENV1288-01 SEC1288-02 REL1288-03 SHP1288-04. **P1:** SHP1288-05 SHP1288-06 SHP1288-07 SHP1288-08 SHP1288-09 SHP1288-10.
- **External evidence gate:** new approved 0; cumulative approved UNKNOWN/10,000; BLOCKED / IN PROGRESS. No runtime code, DB, feature switch, WLD, ledger, Test or Production mutation.
- **Backlog IDs:** ENV1288-01 SEC1288-02 REL1288-03 SHP1288-04 SHP1288-05 SHP1288-06 SHP1288-07 SHP1288-08 SHP1288-09 SHP1288-10
