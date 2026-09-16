# v2026.09.16.136 — Automatic branch reconciliation and cleanup

## Objective
Make branch cleanup the default outcome of the integration pipeline. Managed development branches must not accumulate indefinitely after validation, merge conflicts, or completed integration.

## Changes
- Increased the scheduled integration fallback from hourly to every 15 minutes while retaining event-driven runs after successful `Build Test Candidate` executions.
- The integration workflow now deletes managed branches that are already fully contained in `main`, and closes any still-open PR for those redundant branches.
- Conflicted managed PRs are automatically reconciled against the current `main` using a main-authoritative merge strategy (`git merge -X theirs origin/main`).
- A reconciled branch is pushed back to its source branch and must pass `Build Test Candidate` again for the new exact HEAD SHA before it can merge.
- If reconciliation produces a tree identical to `main`, the PR is closed and the branch is deleted immediately.
- Clean, exact-SHA-validated PRs continue to merge with source-branch deletion enabled.
- The cleanup workflow now runs every 30 minutes in addition to main-push / PR-close events, closes stale PRs for contained branches, and deletes those branches.
- `planning/*`, release, staging, production, develop and main are excluded from automatic reconciliation/deletion.

## Safety / release gate
Automatic conflict handling does not bypass validation. Any branch whose HEAD changes during reconciliation must build and test again at that exact SHA. Production still requires the final merged `main` candidate and the existing isolated-Test / exact-SHA backend gate before promotion.

## Current queue handling
The older branch-auto-promotion implementation is superseded by v2026.09.16.134–136 and should be closed/deleted rather than reintroduced. Remaining feature/security branches are eligible for automatic reconciliation, exact-SHA validation, merge and branch deletion.
