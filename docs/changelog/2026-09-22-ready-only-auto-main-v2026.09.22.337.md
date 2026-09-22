# Ready-only automatic main integration — v2026.09.22.337

Date: 2026-09-22
Scope: GitHub branch integration/cleanup automation and documentation

## Change
- Auto Integrate no longer creates a PR for a branch that has no open PR; such a branch is treated as work in progress.
- Draft PRs and WIP/work-in-progress/do-not-merge/hold/merge-blocked/in-progress labelled PRs are excluded from merge, reconciliation and cleanup.
- Repeatedly failing ready PRs are retained for repair instead of being archived and deleted.
- Scheduled contained-branch cleanup requires merged-PR evidence before deletion.
- Exact-HEAD `Build Test Candidate` success and mergeability remain mandatory before main integration.

## Intended state
Completed ready PRs drain automatically to main; active work is never pulled into main or deleted by the automation.

[executed on device: debian13 (d2f8c9a2-2e5a-4e57-a99d-1a9389e70b4c)]