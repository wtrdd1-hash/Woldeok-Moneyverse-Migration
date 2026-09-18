# GitHub docs reconciliation — v2026.09.19.234

## Baseline
- Exact start main: `e9710efe8c365f683a045ad319da51435f720bb5`.
- Open PR #492 (`docs/project-plan-v232`) had successful CI but `mergeable=false` after main advanced.
- Root cause: `auto-integrate-promote.yml` only managed feat/feature/fix/bugfix/integrate/ops/auto/test-candidate/security branches. `docs/*` branches were never reconciled or merged by the automatic drain.
- The primary MiniPC checkout remains on a deleted remote planning branch with an untracked compose file, so this repair uses an isolated exact-main worktree and does not reset or overwrite it.

## Change
- Added `docs/*` to the managed branch classes in Auto Integrate and Promote.
- Added `docs/*` to repeated-failure reconciliation/cleanup classification so document branches follow the same exact-SHA validation lifecycle instead of becoming permanent stale PRs.
- `planning/*` remains reserved/excluded; this change is intentionally narrow and does not make main-authoritative conflict resolution discard arbitrary planning branches.

## PR #492 preservation
- #492 contains useful fixed/per-install platform-fee and sensitive-action reauthentication planning detail, but its canonical-plan edit is stale relative to v232 admin changes and v233 cycle evidence.
- The stale PR must not be force-merged. Its useful intent is preserved in Git history and is to be reconciled in a newer sequential planning cycle; the stale conflicting PR can then be closed.

## Validation and release gate
- Local `git diff --check` and exact pattern assertions passed; local YAML helper packages were unavailable, so GitHub Actions remains the authoritative workflow parser.
- Push exact branch SHA, run Build Test Candidate, and require success before merge.
- After merge, re-run the automatic drain and confirm `docs/*` branches can be discovered/reconciled while reserved branches remain excluded.
- Runtime services are not mutated by this workflow-only patch; Production promotion still follows exact-SHA Test → main → Production gates.
