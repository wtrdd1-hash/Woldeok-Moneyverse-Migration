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
- [ ] Refresh main/plan and create Draft PR (main unchanged at mid-check)

## Verification checkpoint
- Root `pnpm test` FAILED: Frontend 1,397 PASS / 6 FAIL (existing locale, SEO x3, login touch target, M2 telemetry). API contract and security prefix passed before frontend failure.
- `pnpm audit --prod --audit-level=high` FAILED: 2 High (`body-parser`, `multer`); unrelated to cleanup workflow but release-blocking.
- Real PostgreSQL ACL/finance E2E and official Test exact-SHA not performed; this workflow-only patch does not modify DB or API.
- No main merge, deployment, Production data mutation or other worker branch deletion.

## Finished
- Awaiting remote CI and PR review; release HOLD.
