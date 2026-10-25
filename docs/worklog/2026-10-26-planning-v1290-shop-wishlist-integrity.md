# Planning v1290 — F675-129 Shop Wishlist Price and Availability Integrity

- **Status:** IN PROGRESS / documentation-only / RELEASE HOLD.
- **Cycle:** Previous Feature Addition v1288 → Current Feature Improvement v1290 → Next Feature Addition v1292 (provisional).
- **Canonical source:** GitHub main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; AGENTS.md, README.md, English PROJECT_PLAN.md and Korean comparison.
- **Scope:** Extend the integrated EN/KO planning documents only, preserving stacked Draft #1345, issue #1344, and separate Gemini/Development A/B/C/QA work.
- **Evidence:** migration 165 uses actor- and Seoul-date-specific effective pricing; shop_catalog_list_v2 does not check stock>0 or sale_ends_at; purchase function independently checks stock, account, purchase limit, and member. No production incident asserted.
- **Checklist:** [x] miniPC/GitHub and skills; [x] source/QA read; [ ] integrated English/Korean parity; [ ] P0/P1 acceptance; [ ] middle/final main recheck; [ ] GitHub issue/PR; [ ] verification and release hold.
- **Restrictions:** No runtime code, DB/ledger/WLD, feature switch, Test/Production, migration, or other worker worktree changes.
