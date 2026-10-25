# Planning v1290 — F675-129 Shop Wishlist Price and Availability Integrity

- **Status:** DOCS COMPLETE / DRAFT / RELEASE HOLD.
- **Cycle:** Previous Feature Addition v1288 → Current Feature Improvement v1290 → Next Feature Addition v1292 (provisional).
- **Canonical source:** GitHub main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; AGENTS.md, README.md, English PROJECT_PLAN.md and Korean comparison.
- **Scope:** Extend the integrated EN/KO planning documents only, preserving stacked Draft #1345, issue #1344, and separate Gemini/Development A/B/C/QA work.
- **Evidence:** migration 165 uses actor- and Seoul-date-specific effective pricing; shop_catalog_list_v2 does not check stock>0 or sale_ends_at; purchase function independently checks stock, account, purchase limit, and member. No production incident asserted.
- **Checklist:** [x] miniPC/GitHub and skills; [x] source/QA read; [x] integrated English/Korean parity; [x] P0/P1 acceptance; [x] middle and final main recheck; [x] GitHub issue/PR; [x] docs-only verification and release hold.
- **Restrictions:** No runtime code, DB/ledger/WLD, feature switch, Test/Production, migration, or other worker worktree changes.

## Midpoint evidence
- Remote main unchanged at start/mid; canonical plan blobs EN 51683ec364f9fc1be7bd97e565f48ea2f257ac2a and KO ba7d055fd2c53e2f04282ac0a9448d0ee8e36254.
- QA v1279 raw frontend 1,397 pass / 6 fail; prod/full/bot audits FAIL; route-ledger check invocation missing --inventory; development DB 235/241 writable, PUBLIC bank function count 0 requires independent certification; migration 266 checksum differs.
- EN/KO integrated master and project/feature review: all six documents have identical 10 P0/P1 backlog IDs. No production or code tests performed (docs-only, root disk 98%).
- External reference gate: new approved 0, cumulative independently deduplicated and classified UNKNOWN / 10,000; BLOCKED / IN PROGRESS.

## GitHub review and closeout
- Draft PR #1349: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1349 (base #1345, unmerged).
- Engineering issue #1344 comment 6399972462; capacity issue #1170 comment 6399972903.
- Docs-only verification: 6 EN/KO integrated planning files share exactly 10 P0/P1 IDs; diff --check PASS. No runtime tests, DB writes, production deployment or release authorization.
- Release remains BLOCKED; external independent evidence new approved 0, cumulative UNKNOWN/10,000.
