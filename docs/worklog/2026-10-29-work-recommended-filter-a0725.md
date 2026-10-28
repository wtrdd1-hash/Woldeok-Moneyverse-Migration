# A0725 — Member work board: recommended-only filter

## BEFORE WORK — 2026-10-29 07:29 KST
- Base: `35971c600f25869c96f1c666d4b9f58927202730` (`origin/main`); branch `auto/hourly-a-work-remaining-20261029-0725`; isolated worktree under `build-workspaces`.
- Read AGENTS, README, English/Korean living plans and integrated planning, QA v1359, previous A/B/C PR inventory and release blockers. Existing `work_task_board(actor)` already limits daily exhausted tasks and marks three member-specific recommendations. Do not create a redundant daily-capacity filter.
- Scope selected: P1 member-facing **Today's picks only** toggle for the existing work task board. Strict optional `recommendedOnly=true|false` on guarded `GET /api/v1/work/tasks`, actor-scoped SQL read through existing SECURITY DEFINER `work_task_board($1)`, responsive accessible web toggle, same query through existing Android app-api gateway, and regression tests. Default response unchanged; invalid query 400; no new migration, grant, ledger or state mutation.
- Overlap: A #1788 and #1791 touch work board; preserve both and require sequential rebase before integration. B/C own backend finance and account/auth; avoid their paths.
- Release P0 HOLD: 18,000 WLD historical ledger drift, app-role overprivilege, migration parity, independent backup restore, official exact-SHA Test, root/data/tmpfs 99/99/97%. No deployment or DB write.

## PLAN / IN PROGRESS
- [x] RED tests: strict query, actor-scoped DB predicate, web recommendations, Android gateway query preservation.
- [x] GREEN implementation: controller, repository, UI; no API group expansion or unsafe SQL.
- [x] Verify targeted and full gates subject to disk; isolated real PostgreSQL and exact-SHA CI; document every skip/failure.
- [x] Re-fetch main, inspect PR conflicts, publish Draft PR and exact SHA evidence, preserve other agents' work (PR/CI evidence recorded separately after push).

## FINISHED
Pending verification. No merge or release authorized.

## IN PROGRESS — 07:32 KST
- RED verified: backend recommended SQL/query/controller tests 9 FAIL; frontend recommendation tests 2 FAIL. Existing app-api proxy test added.
- GREEN implementation: strict optional `recommendedOnly` query, actor-bound function SQL predicate, accessible Today’s picks toggle, no-store work app-api responses. No schema, grants or WLD writes.

## MID-CHECKPOINT — 07:35 KST
- New repository unit tests 9 PASS; frontend filter + Android gateway 31 PASS; real DOM recommendation toggle 1 PASS with `NODE_ENV=test` (initial React production-mode test setup failure corrected). Real-PG regression added; without `DATABASE_URL` database suite SKIPS, not PASS.
- Backend/frontend typechecks PASS after repairing **worktree-local dependency linkage** (`undici` from an existing local pnpm store; no tracked dependency changes). First frontend typecheck found a test spy signature defect; fixed and reran. Lint PASS with 0 errors/1099 pre-existing warnings.
- Main rechecked: `35971c600f25869c96f1c666d4b9f58927202730`. Other agents' work untouched. Full suites, build, isolated PG, security audit and CI pending.

## BUILD FAILURE / CORRECTION — 07:40 KST
- Full backend 1,948 PASS / 440 SKIP; frontend 1,875 PASS; database 46 PASS / 4 SKIP; bot 11 PASS. Backend build PASS. Frontend webpack compilation and TypeScript PASS, then Next 16 static generation spawned 15 workers and SIGABRT (exit 1). No feature regression identified.
- Added a bounded `experimental.cpus: 2` build-host resource limit; cleaned only this A0725 worktree's ignored `.next` output (~903 MiB) before retry. No other agents' caches or artifacts touched. This config change is tracked and must pass fresh exact-SHA build/CI.

## FINISHED LOCAL VERIFICATION — 07:45 KST (GitHub CI pending)
- Final code includes optional `recommendedOnly=true|false`, strict validation (including repeated-array rejection), owner-bound PostgreSQL `work_task_board($1)` query, accessible pressed-state web toggle and app-api forwarding/no-store. `@ApiQuery` documents the contract. No new migration, grant, money movement or schema change.
- TDD RED→GREEN: backend 9/9; frontend search+app-api 31/31; DOM accessibility toggle 1/1. Backend authenticated guard/route suite 27/27; final targeted 36/36.
- Full backend **1,948 PASS / 440 SKIP**, frontend **1,875 PASS**, database **46 PASS / 4 SKIP**, bot **11 PASS**. Lint 0 errors/1,099 pre-existing warnings; backend/frontend typecheck PASS; backend build PASS; frontend build PASS with 2 Next static-generation workers after 15-worker SIGABRT. Root and bot production audits: 1 Moderate, 0 High/Critical each.
- Dedicated disposable PostgreSQL **17.11**: all **290 numbered migrations 002–291 applied**, targeted real-PG work tests **31 PASS** including member-specific recommendation predicate; `moneyverse_app` direct `work_task_catalog` SELECT **DENIED** and `work_task_board(uuid)` EXECUTE **GRANTED**. Isolated container stopped, temporary PG data and secret env file deleted after evidence capture; no live DB mutation.
- QA v1359 still FAILED: 18 accounts / +18,000 WLD ledger drift, 239 app-writable public relations, 3 PUBLIC bank EXECUTE, 5 checksum mismatches, 20 unapplied source migrations, independent restore missing. Root/data/tmpfs 99%/99%/97%; Test SHA `cfb13272...` != main/candidate; Production version unknown. Official Test exact-SHA authenticated E2E, independent restore and GitOps release gate **BLOCKED**. No merge or release permitted.
- Mid/final main verified unchanged `35971c600f25869c96f1c666d4b9f58927202730`. Remote inventory before new PR: 112 non-main branches, 109 Draft PRs, 0 duplicate PR head SHAs; three conflicts #1665/#1670/#1701. A #1788/#1791 overlap the same work files and must be sequentially rebased and reverified. All unmerged unique work and 352 historical recovery refs preserved (not re-hashed individually this run). No branches deleted.
- Deployment: Test **NOT DEPLOYED**; Production **NOT DEPLOYED**; rollback **NOT EXECUTED** (candidate never promoted). CI candidate status to be appended to PR; keep Draft/HOLD until official release gates.
