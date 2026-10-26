# Backend B v565 — marketplace listing search literal matching

## Before work
- Started: 2026-10-26 23:00 KST. Authoritative origin/main: `0fe614b2ca1a7bc0df540514e54db78130479e2a`.
- Isolated worktree: `/srv/moneyverse-data/build-workspaces/mv-b-v565-20261026-2300`; branch `auto/hourly-b-marketplace-literal-v565-20261026-2300`.
- Read AGENTS.md, README.md, EN/KO PROJECT_PLAN and integrated planning, recent QA/worklogs, open A/C/B/planning PRs and CI context. Existing open B wallet search PR #1459 is separate; no overlapping marketplace PR identified.
- Selected P1: marketplace listing search treats user-supplied `%`/`_` as SQL LIKE wildcards, widening searches across unrelated ACTIVE listings; unbounded search input can force expensive matching. Only listing read/search behavior is in scope.
- Design: case-insensitive literal substring search on name/description; trim, cap search at 64 characters; deterministic order for equal timestamps; preserve category, active-only, pagination, API shape and all finance writes. TDD RED/GREEN, isolated synthetic PostgreSQL, full repository gates, exact-SHA Test only if release gates allow.
- Superpowers stages: specification and options reviewed (escape LIKE metacharacters vs literal substring; choose literal substring to avoid escape ambiguities), isolated worktree, small-step plan, RED/GREEN, review and verification. No installed Superpowers skill files were found in inspected standard host paths; repository instructions govern.
- Checklist: [ ] RED regression; [ ] GREEN code; [ ] focused and full tests; [ ] isolated PostgreSQL; [ ] mid-work main/plan refresh; [ ] PR and final log; [ ] release gates.

## In progress
- Pending.

## Finished
- Pending. Production HOLD unless all required independent release gates pass.
