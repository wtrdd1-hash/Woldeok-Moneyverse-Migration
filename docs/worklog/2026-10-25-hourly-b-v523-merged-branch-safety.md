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
- [ ] RED negative cleanup regression
- [ ] Minimal workflow safety patch
- [ ] GREEN regression + repository checks
- [ ] Refresh main/plan and create Draft PR

## Finished
- Pending verification.
