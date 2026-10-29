# Development A 2026-10-30 06:25 — owner-bound work task duration filter (P1 repair)

## Before work
- Source main: `62c6cd038951d65c94b709302bdaec6e75b080b6` (fetch at 06:29 KST). Branch `auto/hourly-a-work-duration-repair-20261030-0625`; independent worktree.
- The work page already sends `maxDurationSeconds` but the NestJS task route ignores it; `CareerTasksBoard` accepts `selectedMaxDuration` but does not render a selector. Existing duration tests describe an API incompatible with the now-shipped `minReward` parameter. This is a partially wired member feature, not a new financial function.
- Other open PRs cover wallet, support, notifications, treasury, and shop. This repair changes work task catalogue filtering only. Main remains immutable; no existing migrations or balances will be touched.
- Scope: validate an optional integer 1..86400; filter the actor-scoped `work_task_board` output in SQL before response mapping; preserve `minReward` and default catalogue; show an accessible 60/120/180/300/600/900-second selector and an explicit reset; forward via Android gateway with no-store/noindex; preserve duration metadata for existing active assignments.
- Acceptance: RED/GREEN tests for invalid/duplicate input, bound SQL and actor, combined reward+duration, frontend route/UI, mobile gateway query and privacy; isolated PostgreSQL ACL and owner checks; typecheck/build/lint/security/CI. Do not merge or deploy without all release gates.
- Rollback: revert this branch/PR; default `/api/v1/work/tasks` and original assignment/settlement semantics stay unchanged. No migration or irreversible data change.

## In progress
- Started independent test-first repair. Main and living plan to be rechecked before integration.

## Finished
- Pending verification. Release HOLD until exact-SHA gates pass.

### Mid-run checkpoint 06:33 KST
- RED: baseline duration tests 15 failed, frontend selector test 2 failed. GREEN: Backend duration/reward/controller 28/28; Frontend Android gateway/route/UI 57/57.
- Typecheck all workspaces PASS. Changed-file ESLint 0 errors, 1 pre-existing `selectedDifficulty` unused warning. Full lint, build, real PG and CI pending.
- Work filter is a read-only bound predicate on `work_task_board($1)`. Default and existing `minReward` paths preserved; active assignments retrieve the full duration metadata and fail closed when unavailable.
- Refetched origin/main and bilingual plans before integration; no production/test mutation.

## Finished — 06:47 KST (implementation; release not approved)
- Final code scope: owner-scoped optional duration filter in NestJS controller/repository, parameterized SQL over `work_task_board($1)`, a bilingual accessible web selector, active assignment metadata fail-closed, Android query forwarding/privacy regression and bilingual mobile endpoint documentation. No migration, grants, settlement or ledger changes.
- Isolated PostgreSQL 17.11: all 304 main SQL migrations applied to an ephemeral container, real app-role duration read/ACL test 1 PASS; container removed. Database unit tests 56 PASS / 4 SKIP.
- Backend focused duration/reward tests 28 PASS; Frontend web/Android focused tests 57 PASS. Full workspace typecheck PASS. Backend build PASS; full workspace production build PASS using an isolated `/tmp` bind mount for the Next build directory (unmounted and cleaned afterward). Security advisory regressions 11 PASS; production dependency audit 0 known vulnerabilities; changed-file ESLint 0 errors, 1 unrelated unused-parameter warning.
- Full lint FAIL: 3 pre-existing empty-block errors in `stale-tab-notice.tsx` (1051 warnings). Backend full 2367 PASS / 225 FAIL / 493 SKIP; frontend full 2536 PASS / 61 FAIL. Mobile generated contract check FAIL: pre-existing NPC `affinity` number/null schema drift; unrelated generated files restored in this isolated worktree.
- Official Test and Production are unchanged at Backend `c2129625aa6629c616fb31ce790950618b8d92b2`. Test public Treasury overview still returns HTTP 200; Production frontend-version remains `1793277134644` (not an approved source SHA); Production Treasury overview HTTP 503. Exact candidate SHA Test authenticated E2E and GitOps financial/recovery gates are NOT verified.
- Storage incident: Debian data mount 100% full (311–1300 MiB available during run). No other task caches, containers, branches or evidence were deleted; build output used a temporary bind mount and was cleaned.
- Start remote branches 35, open PRs 29. Pre-integration remote branches 36, open PRs 30, 2 conflicting, 0 duplicate PR heads; 32 unique-unmerged branches and 3 previously merged branches were preserved. Deleted branches 0, forced PR closes 0, merges 0. Preservation reason: parallel B/C/QA/planning/Gemini and historical recovery refs cannot be assumed disposable.
- Release decision: **DRAFT PR #1951 / HOLD**. No official Test deployment, Production promotion, production DB write, rollback or branch deletion. Final candidate SHA and exact-SHA CI verdict recorded in the PR and external QA/release evidence.
