# Internal Worklog — Branch Cleanup Automation v2026.09.12.15

Date: 2026-09-12
Branch: `ops/auto-branch-cleanup-v2026.09.12.15`

## Reviewed

- Current application CI/test-candidate/production-release workflows.
- Current GitOps deployment flow and `wdmv-auto-reconcile.yml` behavior.
- Open PRs and active work branches to avoid overlap with runtime feature development.

## Change

Added `.github/workflows/cleanup-merged-branches.yml` with two guarded paths:

1. On a PR merged into `main`, delete only the same-repository source branch.
2. On the daily/manual cleanup pass, compare every non-reserved branch against `main` and delete it only when `main` is not behind that branch, meaning no branch-only commits remain.

## Release flow confirmation

The existing GitOps reconciler already polls successful `main` test candidates, updates isolated test manifests, waits for exact-SHA test verification, then consumes the production-ready signal to update production manifests. This change does not bypass those gates.

## Limitation during implementation

The configured mini-PC development device was offline, so this repository-only automation change was made through the GitHub connection. Runtime application code was not changed.
