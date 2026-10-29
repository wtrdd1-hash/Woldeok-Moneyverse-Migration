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
