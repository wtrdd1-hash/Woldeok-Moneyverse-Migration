# Hourly A — Public board discussion category discovery

## Before work (2026-11-01 07:25 KST)
- Scope: one P1 read-only feature — filter the **latest 50 public posts** by existing stock-discussion category (`analysis`, `question`, `journal`, `business`, `system`), retaining stock/title search. Never represent this as full-history search.
- Source: `origin/main` at start; see `git rev-parse HEAD`. Working copy is a separate `auto/hourly-a-*` worktree.
- Source-of-truth: existing `public.member_board_public_list_with_stock(50)` SQL SECURITY DEFINER function; no new SQL DDL, grants, migrations or ledger changes. Filtering occurs **after** the bounded DB function, with no private data reads.
- Stages: [x] inspect policies/English+Korean plans/open PRs/QA; [ ] RED tests; [ ] implementation; [ ] targeted gates; [ ] full gates; [ ] exact-SHA CI; [ ] official Test E2E; [ ] production gate.
- Overlap review: current B/C PRs focus on banking, enterprise, stock and security. Previous A board title and replies filters are distinct; this change adds category filtering without modifying their branches.
- Release state: HOLD until exact-SHA CI, isolated PostgreSQL, authenticated Test and GitOps/backup/ACL gates are verified. Rollback: omit `category` query, or revert this read-only change.

## In progress (2026-11-01 07:25 KST)
- RED observed: backend 3 failing new tests; frontend 4 failing new tests.
- GREEN observed after implementation: backend 22/22 and frontend 13/13 targeted tests pass.
- Changed: public controller allowlist, bounded SQL category predicate, accessible board form, Android category query and upstream response proof, regressions. Existing `member_board_public_list_with_stock(50)` remains the only SQL source.
- Next: typecheck/lint/full suites, actual read-only PostgreSQL role check, exact-SHA CI. No Test or Production mutations.
