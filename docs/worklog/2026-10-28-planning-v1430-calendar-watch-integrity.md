# Planning v1430 — F675-163 calendar watch integrity (2026-10-28 KST)

## BEFORE WORK — 23:06–23:09 KST
- Previous: Feature Addition v1428; Current: Feature Improvement v1430; Next: Feature Addition v1432 (provisional).
- Main 35971c600f25869c96f1c666d4b9f58927202730; predecessor Draft #1749 head e65a654ddad4defaacb8bcd03bdfb4f5e7204f74. Worktree and branch isolated; predecessor not merged.
- skills__list returned empty; miniPC installed using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion read. Authoritative AGENTS.md, README.md, PROJECT_PLAN.md and PROJECT_PLAN.ko.md reviewed.
- Verified main code: calendar helper filters valid timestamps but not past dates; shop_catalog_list_v2 returns shop_catalog.sale_ends_at, while shop_inventory.starts_at/ends_at gates catalog visibility; season event ends_at is virtual_seasons.ends_at. Existing tests use past timestamps without a clock.
- QA v1350 FAILED; disk 98%; 18,000 WLD historical divergence, DB grants/migration parity, independent restore and official exact-SHA Test remain HOLD.
- Plan: fix deadline source provenance, stale/changed watch handling, server-time eligibility, source-update races, tests, release gates in existing integrated EN/KO docs. No runtime/DB/Test/Production writes.

## IN PROGRESS
- [x] Inspect actual main and unmerged predecessor.
- [ ] Write canonical English and Korean parity changes in existing integrated planning.
- [ ] Validate ten backlog IDs, all EN/KO pairs, docs-only diff, no secrets.
- [ ] Push Draft PR and GitHub issue handoff.

## FINISHED
- PENDING: final verification, SHA and PR evidence.
