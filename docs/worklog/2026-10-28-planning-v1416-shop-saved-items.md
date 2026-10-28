# Planning v1416 — Member shop saved-items shortlist (Feature Addition)

**Status:** IN PROGRESS / DRAFT / RELEASE HOLD. Previous Improvement v1414 → Current Addition v1416 → Next Improvement v1418 provisional. Source main d12c948ac454b0762cfb7fb0cddf83703a775172.

## Before work 16:08 KST
Read Superpowers locally after skills connector returned no URI; inspected miniPC, GitHub, AGENTS, README, canonical English/Korean plans, Next/NestJS/DB/app-api, QA v1343. Created isolated branch/worktree. Initial category-notification idea was exploratory, not an approved implementation.

## In progress 16:12–16:17 KST
Found existing F675-130/#1353 notification controls and F675-102/103; **rejected duplicate idea** and pivoted to shop saved-items. Read /shop/catalog, shop controller/repository, migrations 071/073/075; catalog has no owner saved-items API/table in inspected paths, seeded quantity NULL is unlimited. Rechecked main d12c948... unchanged. Drafted EN/KO integrated spec, P0/P1 and update records; no product code changes. Data disk 96%; QA v1343 identified 18,000 WLD dividend drift and treasury 0, separate #1706.

## Checklist / release gates
- [x] Main/QA/PR/source review and overlap correction.
- [x] EN/KO integrated master, project plans, feature review and logs.
- [ ] GitHub issue/PR and final SHA/CI verification.
- [ ] Completion record and final main recheck.
P0 ENV1416-01 FIN1416-02 SEC1416-03 REL1416-04; P1 SHOP1416-05 SHOP1416-06 SHOP1416-07 SHOP1416-08 SHOP1416-09 SHOP1416-10.
Synthetic 10,001/100/100 acceptance specified NOT RUN; external accepted 0 new, cumulative UNKNOWN/10,000 BLOCKED. Official Test exact-SHA, independent restore, finance reconciliation and Production approval remain HOLD.
