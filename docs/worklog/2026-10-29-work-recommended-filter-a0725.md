# A0725 — Member work board: recommended-only filter

## BEFORE WORK — 2026-10-29 07:29 KST
- Base: `35971c600f25869c96f1c666d4b9f58927202730` (`origin/main`); branch `auto/hourly-a-work-remaining-20261029-0725`; isolated worktree under `build-workspaces`.
- Read AGENTS, README, English/Korean living plans and integrated planning, QA v1359, previous A/B/C PR inventory and release blockers. Existing `work_task_board(actor)` already limits daily exhausted tasks and marks three member-specific recommendations. Do not create a redundant daily-capacity filter.
- Scope selected: P1 member-facing **Today's picks only** toggle for the existing work task board. Strict optional `recommendedOnly=true|false` on guarded `GET /api/v1/work/tasks`, actor-scoped SQL read through existing SECURITY DEFINER `work_task_board($1)`, responsive accessible web toggle, same query through existing Android app-api gateway, and regression tests. Default response unchanged; invalid query 400; no new migration, grant, ledger or state mutation.
- Overlap: A #1788 and #1791 touch work board; preserve both and require sequential rebase before integration. B/C own backend finance and account/auth; avoid their paths.
- Release P0 HOLD: 18,000 WLD historical ledger drift, app-role overprivilege, migration parity, independent backup restore, official exact-SHA Test, root/data/tmpfs 99/99/97%. No deployment or DB write.

## PLAN / IN PROGRESS
- [ ] RED tests: strict query, actor-scoped DB predicate, web recommendations, Android gateway query preservation.
- [ ] GREEN implementation: controller, repository, UI; no API group expansion or unsafe SQL.
- [ ] Verify targeted and full gates subject to disk; isolated real PostgreSQL and exact-SHA CI; document every skip/failure.
- [ ] Re-fetch main, inspect PR conflicts, publish Draft PR and exact SHA evidence, preserve other agents' work.

## FINISHED
Pending verification. No merge or release authorized.

## IN PROGRESS — 07:32 KST
- RED verified: backend recommended SQL/query/controller tests 9 FAIL; frontend recommendation tests 2 FAIL. Existing app-api proxy test added.
- GREEN implementation: strict optional `recommendedOnly` query, actor-bound function SQL predicate, accessible Today’s picks toggle, no-store work app-api responses. No schema, grants or WLD writes.

## MID-CHECKPOINT — 07:35 KST
- New repository unit tests 9 PASS; frontend filter + Android gateway 31 PASS; real DOM recommendation toggle 1 PASS with `NODE_ENV=test` (initial React production-mode test setup failure corrected). Real-PG regression added; without `DATABASE_URL` database suite SKIPS, not PASS.
- Backend/frontend typechecks PASS after repairing **worktree-local dependency linkage** (`undici` from an existing local pnpm store; no tracked dependency changes). First frontend typecheck found a test spy signature defect; fixed and reran. Lint PASS with 0 errors/1099 pre-existing warnings.
- Main rechecked: `35971c600f25869c96f1c666d4b9f58927202730`. Other agents' work untouched. Full suites, build, isolated PG, security audit and CI pending.
