# Planning v1266 — Calendar Source/ICS Integrity (Documentation Draft / HOLD)

- Draft PR [#1274](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1274) OPEN/HOLD; engineering issue [#1267](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1267) updated.

2026-10-25 KST. Previous Feature Addition v1264 → Current Feature Improvement v1266 → Next Feature Addition v1268 provisional. Unmerged parent Draft #1268; engineering issue #1267.

- Source-of-truth main c9a868b1e622341e2daa8b936ddf0988eda9988e, AGENTS.md, README.md, canonical English and Korean PROJECT_PLAN. Rechecked start/mid. Local Superpowers using-superpowers, brainstorming, using-git-worktrees, writing-plans, verification-before-completion applied; plugin skills unavailable.
- Code-backed findings: season_active_events() exposes parent season.ends_at; season_event_admin_update() mutates title/active without revision; shop_catalog_list_v2 exposes sale_ends_at while inventory starts/ends gate availability; upcomingShopDeadlines() accepts elapsed parseable timestamps. No change feed. Proposed monotonic source revision, explicit parent/source eligibility, changed-deadline acknowledgement and consistent one-transaction ICS snapshot. Not implemented.
- Full ten-task P0/P1 engineering backlog in English/Korean integrated master, with API, DB, transaction, security, Android, SEO, a11y, admin, KPI, isolated regression, exact-SHA Test and rollback.
- Latest completed QA v1267 FAILED/HOLD; root 100%/181MiB free at start, dev DB app UPDATE/DELETE 235/241, three PUBLIC bank functions, migration266/280, six frontend tests, security audit and exact-SHA Test/restore remain blocked.
- External independent evidence gate: newly approved 0, cumulative deduplicated approved UNKNOWN of 10,000; BLOCKED/IN PROGRESS. No fake source counts.
- Planning docs and worklog only; no runtime/DB/WLD/ledger/feature-switch/Test/Production changes; no other worker worktree touched.
