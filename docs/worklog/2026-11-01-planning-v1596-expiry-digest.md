# Planning v1596 — F675-205 Owner Inventory Expiry Daily Digest (2026-11-01)
- [x] START: miniPC Debian 13.6, seven services active, development PostgreSQL connected; installed Superpowers using-superpowers/brainstorming/writing-plans/using-git-worktrees/verification read. skills__list returned zero URIs, so skills__read BLOCKED; local skill fallback used.
- [x] SOURCE: origin/main f13bbce273ffc65e8576170992d82ea00c27a1c9, AGENTS.md, README.md, English canonical and Korean plan, previous Draft #2290, A/B/C PRs, QA v1433 issue #2292, migration 071/123, Nest notification and shop, Next /inventory and /account/notifications, app-api gateway.
- [x] MID: main and canonical docs rechecked; prior unmerged planning sections carried into isolated worktree. Existing notification inbox and PRODUCT_ACTIVITY category observed, but no in_app_notifications CREATE TABLE in numbered migrations: schema parity is a blocker, not assumed fixed.
- [x] DESIGN: opt-in daily KST inventory expiry digest; owner settings, bounded scheduled inbox delivery, dedupe receipt, fail-closed security and privacy, mobile/a11y/admin/KPI, 4 P0 and 6 P1 backlog.
- [x] VERIFY: local 140/140 release PASS and 24/24 classifier PASS; remote final SHA CI must be checked separately. English/Korean parity, release classification, source docs, Git diff, exact SHA CI.
- [ ] FINISH: GitHub Draft PR, issue and logs; no main merge, runtime, DB, WLD, item, Test or Production mutation.
- **Cycle:** Previous Improvement v1594 / Current Addition v1596 / Next Improvement v1598 (provisional). **Status:** DRAFT / RELEASE HOLD. External evidence newly approved 0; cumulative UNKNOWN / 10,000 BLOCKED / IN PROGRESS.

- GitHub development handoff: #2296; documentation-only isolated branch, no new feature acceptance test.
- Draft PR #2297 OPEN/HOLD. Initial unconstrained release test encountered miniPC cgroup thread exhaustion; sequential rerun 140/140 PASS.
