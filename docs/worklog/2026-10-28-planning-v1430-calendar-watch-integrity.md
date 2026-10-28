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
- [x] Write canonical English and Korean parity changes in existing integrated planning.
- [x] Validate ten backlog IDs, all EN/KO pairs, docs-only diff, no secrets.
- [x] Push Draft PR and GitHub issue handoff.


## MIDPOINT — 23:11 KST
- Latest main rechecked and unchanged; v1428 Draft #1749 remains unmerged. 12 further documentation files updated, English canonical and Korean equivalent.
- Source correction and explicit revision-bound deadline confirmation documented. QA v1350 FAILED; external accepted newly 0, cumulative UNKNOWN / 10,000 BLOCKED / IN PROGRESS; release HOLD.

## FINISHED
- 23:12 KST: seven EN/KO pairs PASS, ten unique backlog IDs PASS, fourteen docs-only changed, git diff --check PASS, release classifier 17/17 PASS.
- Draft PR #1753 and issue #1748 updated; stacked on unmerged #1749, no independent merge. Content commit 15214c2c952d999c73601c9fdd751c89ffc7b565.
- GitHub classify, release-input and verify/classify PASS; policy and verify/policy PENDING at 23:12. Official Test and Production remain uncertified. QA v1350 FAILED, disk 98% / 3.9GiB free, RELEASE HOLD.
- External independent accepted new 0, cumulative UNKNOWN / 10,000 BLOCKED / IN PROGRESS. No runtime/DB/WLD/Test/Production changes. Final SHA in miniPC completion record.
