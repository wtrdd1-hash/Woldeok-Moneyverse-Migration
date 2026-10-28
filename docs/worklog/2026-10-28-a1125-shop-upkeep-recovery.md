# Development A 11:25 KST — Shop upkeep attention recovery

- Source: closed-unmerged PR #1636 (`594b51ede1b921e43cc5b282113c1f7824d0b6a0`), preserved after P0 mass closure #1663. Recovery is a **new** branch from current `main` `a28bed9aa40ff74d492824ae12892a7d52132fdd`: `auto/hourly-a-shop-upkeep-recovery-20261028-1125`.
- Restored the owner-only `GET /api/v1/shop/holdings?status=attention` read filter, catalogue UI controls, Android app-api privacy cache boundary and regression tests. Uses the existing `shop_my_items_v2(actor)` database function. No migration, WLD, ledger, purchase or settlement mutation.
- TDD: the recovered backend/frontend tests failed on clean main before the implementation was applied; focused tests subsequently passed (backend 5, frontend 29). A gateway conflict was resolved by preserving the newer privacy `noindex` and `no-store` protections **as well as** the shop `no-store` fence.
- Baseline review: main AGENTS.md, README, English/Korean project plans and integrated masters, recent QA, open PRs and CI checked. Main SHA rechecked during development; no other worker worktree modified.
- Change list: shop controller, strict filter and tests, member catalogue page/filter and tests, Android gateway and tests, plan, English/Korean QA/release/worklog. Old PR remains closed but its unique commit and 352 incident recovery refs are retained.
- Final gate results, exact candidate SHA, CI and start/end remote branch/PR counts are in the corresponding QA/release evidence and host report `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-28-1125/`.
