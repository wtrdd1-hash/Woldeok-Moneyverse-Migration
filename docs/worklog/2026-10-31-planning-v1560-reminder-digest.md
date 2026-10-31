# v1560 Planning Worklog — Owner Expiry Reminder Daily Digest

## BEFORE WORK — 2026-10-31 16:10 KST
- Previous Feature Improvement v1558; Current Feature Addition v1560; Next Feature Improvement v1562 (provisional).
- Authority checked: `AGENTS.md`, `README.md`, English canonical `docs/planning/PROJECT_PLAN.md`, Korean counterpart; origin/main `1a3625f3c5e426c857e2b44a412d7949ac4a6257` at start; parent Draft PR #2157 head `ced5ee5e0a8f58b58c8f183807b4e246974c05ba`. Parent is not merged; this is a stacked Draft, not main.
- Superpowers skills: using-superpowers, brainstorming, using-git-worktrees, writing-plans, verification-before-completion read from miniPC; skills connector returned no available URIs.
- Source inspected: migration 071 user_items; 123 shop_my_items_v2; Nest notification.service and search; Next inventory/page.tsx and app-api gateway. Reminder preferences, per-item mute, activity and preview are UNIMPLEMENTED Draft dependencies. Existing notification search link allowlist excludes /inventory; current inventory apiOrNull can display outage as empty.
- Planned design: F675-196 opt-in daily consolidated **in-app** expiry reminder digest to reduce notification flooding, no external email/push, no WLD/ledger mutation. Compare single-item alerts vs per-day grouping; require per-threshold receipt truth and atomic group membership. Never claim delivery without committed inbox row.
- P0 production release/finance/DB ACL/QA gates remain HOLD. External evidence 0 new; cumulative UNKNOWN/10,000, BLOCKED/IN PROGRESS.
- [x] Start checkpoint and authority/source review. [ ] Define English/Korean equivalent spec. [ ] Update P0/P1 backlog. [ ] Validate docs and cycle. [ ] GitHub issue/PR/CI. [ ] Final checkpoint.

## IN PROGRESS
- Pending canonical design and risk/QA review. No runtime or database changes permitted.

## FINISHED
- Pending final verification. RELEASE HOLD.
