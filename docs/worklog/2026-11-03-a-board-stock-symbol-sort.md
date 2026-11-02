# Development A — Verified recent board stock-symbol ordering

## Before work (2026-11-03 01:29 KST)
- Baseline origin/main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`, separate `auto/hourly-a-20261103-0129-board-symbol-sort` worktree. 303 remote tracking refs, 273 open PRs at start; no branch deletion.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and PROJECT_PLAN.ko.md, latest QA/release conditions, and recent open A/B/C PRs. English plan is authoritative; Korean is a secondary translation. This is an independent P1 user-visible feature; do not overlap existing board filters or backend B/frontend C work.
- Scope: offer recent/stock-symbol alphabetical order of **only the latest 50 public posts**. Untagged posts last; ties by newest creation time and UUID. No financial writes, migration, direct table grants, or broader archive search. The existing SECURITY DEFINER public listing remains the sole source.
- Acceptance: strict query validation, keyboard-accessible Next control, noindex filtered pages, Android fail-closed sort verification, backend/SQL and web/app-api regression tests. No rollout until all release gates PASS.
- Plan: RED tests -> minimal implementation -> focused tests -> full checks -> independent PostgreSQL/CI and Test checks -> HOLD if any gate fails.

## In progress
- [ ] RED tests observed
- [ ] backend, frontend, Android app-api and SQL source query implemented
- [ ] focused tests and complete gates
- [ ] mid/final main recheck, QA and release decision

## Finished
- Pending. Test/Production untouched; no branch deletion.
