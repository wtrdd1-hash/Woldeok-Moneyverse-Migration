# Development A — Verified recent board stock-symbol ordering

## Before work (2026-11-03 01:29 KST)
- Baseline origin/main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`, separate `auto/hourly-a-20261103-0129-board-symbol-sort` worktree. 303 remote tracking refs, 273 open PRs at start; no branch deletion.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and PROJECT_PLAN.ko.md, latest QA/release conditions, and recent open A/B/C PRs. English plan is authoritative; Korean is a secondary translation. This is an independent P1 user-visible feature; do not overlap existing board filters or backend B/frontend C work.
- Scope: offer recent/stock-symbol alphabetical order of **only the latest 50 public posts**. Untagged posts last; ties by UUID (stable, independently verifiable). No financial writes, migration, direct table grants, or broader archive search. The existing SECURITY DEFINER public listing remains the sole source.
- Acceptance: strict query validation, keyboard-accessible Next control, noindex filtered pages, Android fail-closed sort verification, backend/SQL and web/app-api regression tests. No rollout until all release gates PASS.
- Plan: RED tests -> minimal implementation -> focused tests -> full checks -> independent PostgreSQL/CI and Test checks -> HOLD if any gate fails.

## In progress
- [x] RED tests observed: backend 3 failed, frontend module missing
- [x] backend, frontend, Android app-api and SQL source query implemented; focused backend 18/18, frontend 12/12, typecheck PASS
- [x] focused tests; full gates pending
- [ ] mid/final main recheck, QA and release decision

## Finished
- Pending. Test/Production untouched; no branch deletion.

### Midpoint verification (01:32–01:46 KST)
- Re-fetched main at start, middle, and before release: unchanged `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`.
- Commits: initial log `b9267d813202707b55efd7471ee3c66f658682aa`, feature `0a897b781230e3eeb37a479a8d37ee10caf2eff1`, contract `ec99805b1bcf86fbd9e115c84b6dd0902a0944b7`, proof hardening `5abe3792d80e5f11db4dc80cc0f0d15355a3cbea`.
- RED -> GREEN; 184 Android contract endpoints, strict source marker, Next noindex, no direct table access. Full frontend 2,951 PASS at contract SHA; full backend 2,986 PASS/2 FAIL/518 SKIP, database 72 PASS/5 SKIP, contract 41 PASS, static 34 PASS. Lint 0 errors/1,027 warnings, build PASS. Full audit 9 vulnerabilities, DEV DB ACL P0 fail. See English/Korean QA.
- Branch audit: 303 remote non-main refs (285 unique unmerged, 18 merged ancestor), 273 open PRs, 29 conflicting, 38 PRs with failing CI. Existing PR #2554/#2526/#2494/#2448 merge-tree conflicts. 0 branches deleted; preserve all unique changes and other agent worktrees.
- Disk started 96% / 4.5GB available; own generated `.next` (994MB) removed after successful build and saved log, restoring 4.4GB available. No other task data removed.
- Official Test and Production run different SHA; no Test E2E, independent restore, promotion, or rollback. Release HOLD.
