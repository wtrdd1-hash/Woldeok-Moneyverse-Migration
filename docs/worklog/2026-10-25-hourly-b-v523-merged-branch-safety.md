# Development B v523 — preserve unique merged-PR branch history (P0)

## Before work — 2026-10-25 05:35 KST
- Base `origin/main`: `c9a868b1e622341e2daa8b936ddf0988eda9988e`.
- Branch: `auto/hourly-b-merged-branch-safety-v523-20261025-0535`, isolated data-volume worktree.
- miniPC Debian 13.6 confirmed using status, shell, and file-read MCP; root filesystem 100% (635 MiB free), data volume 43%.
- Read AGENTS.md, README.md, canonical and Korean project plans, runtime/releasing documentation, open PRs, QA #1190, CI and issues #1016/#1022/#1088.
- P0 defect: `.github/workflows/cleanup-merged-branches.yml` has a `pull_request.closed` job deleting the merged PR's source ref on event alone. Squash merges do not make the source tip an ancestor of main; deletion can discard a uniquely referenced commit. The separate scheduled prune path already checks exact merged-PR head and main ancestry.
- Overlap check: PR #1098 is a distinct *auto-integrate* workflow fix, not merged-branch cleanup; #1148 handles migration collisions. Do not modify their files or branches.
- Planned: TDD negative regression; disable merged-event deletion; retain ancestry-proven scheduled prune; verify targeted tests and required checks; no automatic merge or Production release.

## In progress
- [x] RED negative cleanup regression: 1 failure / 2 pass (merged-event deletion exposed)
- [x] Minimal workflow safety patch: removed merged-event destructive job; preserved exact-head/ancestry/lease scheduled prune, protected stacked open PRs, reduced PR permission to read
- [x] GREEN: 59/59 release tests; lint 0 errors (1,137 warnings), typecheck PASS, build PASS, backend 1,313 PASS / 398 SKIPPED, database 15 PASS / 3 SKIPPED, workflow YAML parsed
- [x] Refreshed main/English+Korean plans (unchanged `c9a868b1`); Draft PR #1225 created, merge blocked

## Verification checkpoint
- Root `pnpm test` FAILED: Frontend 1,397 PASS / 6 FAIL (existing locale, SEO x3, login touch target, M2 telemetry). API contract and security prefix passed before frontend failure.
- `pnpm audit --prod --audit-level=high` FAILED: 2 High (`body-parser`, `multer`); unrelated to cleanup workflow but release-blocking.
- Real PostgreSQL ACL/finance E2E and official Test exact-SHA not performed; this workflow-only patch does not modify DB or API.
- No main merge, deployment, Production data mutation or other worker branch deletion.

## Finished — 2026-10-25 05:43 KST
- PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1225 (Draft/HOLD).
- Version sequence: `b7729c28` initial worklog -> `bb70a63b` tests/log -> `a753ee95` workflow via GitHub connector (Git CLI OAuth lacked workflow scope) -> final worklog-only SHA is the remote PR head after this log commit.
- Exact code SHA `a753ee95d420e57808dc49126eed76b79f09ebb2`: GitHub CI #40130943572 and Build Test Candidate #40130910543 were in progress at 05:42 KST. Final worklog SHA requires its own fresh CI; pending, not PASS.
- Main start/mid/end `c9a868b1e622341e2daa8b936ddf0988eda9988e`; no merge. Plan English/KO unchanged. Open PR #1098 release-gate bypass remains separate/unmerged.
- Test public `/api/version`: `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production: `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither is candidate. No Test deployment or Production promotion.
- Change scope: CI branch cleanup workflow + 3 regression tests + worklog; API/DB/migrations/ledger untouched.
- Root filesystem 100% full (about 633 MiB free), data volume 44%; task worktree/logs isolated on data volume.
- Five core Development A/B/C, Planning, QA automations remain enabled; no schedule changed. No other branches/worktrees modified, merged, closed, or deleted.
- Remaining BLOCKED: frontend 6 failures, dependency audit 2 High, real PostgreSQL/authenticated E2E, official Test exact-SHA and final CI; PR must stay Draft and Production HOLD.
