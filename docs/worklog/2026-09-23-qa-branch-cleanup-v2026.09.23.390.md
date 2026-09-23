# QA Branch Lifecycle Cleanup — v2026.09.23.390

## Scope

Harden QA branch cleanup so merged source branches do not accumulate after squash merges, while preserving any branch that contains post-merge work.

## Checklist

- [x] Inventory remote branches, local branches, and linked worktrees.
- [x] Delete only branches already merged or patch-equivalent to `main`.
- [x] Preserve branches with unique unmerged commits.
- [x] Fix squash-merge cleanup detection.
- [x] Add atomic expected-SHA deletion with `git push --force-with-lease`.
- [x] Preserve branches that move after validation.
- [x] Record EN/KO internal and GitHub update notes.
- [x] Run exact-head CI after each substantive update.
- [ ] Merge PR #686 after the final exact-head CI and review gates pass.
- [ ] Run the merged cleanup workflow against the remaining remote branch set.
- [ ] Record final remote/local/worktree counts.

## Checkpoints

### Checkpoint 1 — Repository inventory and manual cleanup

- Migration remote branches: approximately 71 down to 39.
- App remote branches: 5 down to 4 after deleting the already-merged planning-rule branch.
- Local branches: 149 down to 60.
- Linked worktrees: 61 down to 34.- 37 clean worktrees whose commits were patch-equivalent to `main` were removed.
- Unique unmerged branches were retained.

### Checkpoint 2 — Root cause

`cleanup-merged-branches.yml` required ancestry/containment evidence that does not hold for squash merges. A successfully squash-merged PR could therefore leave its source branch indefinitely.

### Checkpoint 3 — First workflow fix

The scheduled cleanup now treats a branch as deletable when its current HEAD exactly matches the HEAD SHA of a merged PR, while retaining a branch that advanced after merge.

Validation:
- `git diff --check`: PASS.
- Build Test Candidate run 35802217816 for `e486e0dd534fb6fd0fa22159d018e78eda11614e`: SUCCESS.
- CI run 35802417185 for `3b486419f680d1030861c6577866d37c35831afd`: SUCCESS.

### Checkpoint 4 — Review hardening

PR review identified a race between the SHA read and name-only ref deletion. Both the pull-request-close path and scheduled prune path now use an expected-SHA `git push --force-with-lease` deletion so a concurrent push causes deletion to fail safely.

## Deployment state

This change is GitHub repository automation and documentation only. It does not modify backend/frontend runtime code, schema, production data, or deployed services. Runtime Test/Production promotion is therefore not applicable. The repository exact-head CI gate remains mandatory before merge.
