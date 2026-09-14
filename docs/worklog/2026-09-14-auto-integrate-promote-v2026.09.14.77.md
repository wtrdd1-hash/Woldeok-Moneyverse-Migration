# v2026.09.14.77 — Automatic branch integration and promotion

## Scope

- Branch: `ops/auto-merge-promote-v2026.09.14.77`
- Added `.github/workflows/auto-integrate-promote.yml`.
- Eligible development branches are integrated to `main` only when their current HEAD has a successful exact-SHA `Build Test Candidate` run and GitHub reports the integration PR as mergeable.
- The workflow integrates at most one branch per run, uses squash merge, requests source-branch deletion, and explicitly dispatches the `main` Test Candidate workflow after merge.
- Existing release gates remain authoritative: isolated Test must serve the exact main SHA, the backend/database public-catalog smoke check must pass, Production images are built from that same SHA, and the GitOps reconciler handles Production promotion.
- `.github/workflows/cleanup-merged-branches.yml` remains as a secondary cleanup safety net.

## Version sequence

1. `v2026.09.14.77-01` — inspect current branch cleanup and Test→Production chain.
2. `v2026.09.14.77-02` — add guarded automatic branch integration workflow.
3. `v2026.09.14.77-03` — align release documentation and Korean secondary documentation.
4. `v2026.09.14.77-04` — validate CI/Test chain on the change branch.
5. `v2026.09.14.77-05` — merge to `main`, confirm Test backend, and allow existing Production GitOps promotion.

## Fail-closed behavior

Branches with no successful exact-head Test Candidate run, branches with merge conflicts, branches whose HEAD changes after validation, and branches outside the allowlisted prefixes are skipped rather than merged.
