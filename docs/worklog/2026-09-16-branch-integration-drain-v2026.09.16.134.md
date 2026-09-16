# Branch integration drain reliability — v2026.09.16.134

## Scope

The automatic branch integration workflow was running on its schedule, but it could merge at most one eligible branch per invocation. Because GitHub scheduled jobs can also start late, validated branches and open PRs accumulated even though their candidate checks were green.

## Evidence before change

- Scheduled `Auto Integrate and Promote` runs were present, including a successful run at 2026-09-15T22:00:05Z.
- That run skipped conflicted PR #341, merged PR #349, dispatched the main candidate, and then stopped processing the remaining validated branches.
- Open validated PRs remained after the run, including #344, #346, #350, and #351.
- The existing shell loop was fed through a pipeline; `exit 0` terminated the loop subshell after the first merge, so the run never drained the queue.

## Change

1. Added a `workflow_run` trigger so a successful development-branch `Build Test Candidate` can start integration without waiting for the hourly cron fallback.
2. Replaced the piped `while` loop with a `mapfile` + `for` loop so one serialized run can evaluate every eligible branch.
3. Kept exact-head candidate validation as a hard gate before merge.
4. Continued past dirty/conflicted PRs instead of allowing one blocked branch to starve later mergeable branches.
5. Dispatch exactly one `main` Test Candidate after all merges in the drain, so the final combined main SHA is what enters isolated Test and the production gate.
6. Included `security/*` in the managed development branch prefixes because the repository currently uses that prefix for active work.

## Release safety

Production promotion remains unchanged: final `main` must build successfully, the isolated Test host must serve the exact main SHA, the backend public-catalog/database path must pass, Test must remain `noindex`, and only then can production images be marked ready. Conflicted branches are never auto-resolved or force-merged.
