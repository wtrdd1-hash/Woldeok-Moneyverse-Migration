# All-branch integration v2026.09.26

## Before work

- **Status:** completed
- **Scope:** inventory every current remote branch, determine whether it is
  already contained in `origin/main`, and integrate only candidates that remain
  compatible with the latest main, repository invariants, and release gates.
- **Starting main:** `242e1bb6a2340f074298dded91d2f367cfc5be01`
- **Safety boundary:** no Production promotion is part of this integration.
  Any runtime candidate requires exact-SHA Test evidence and the documented
  promotion procedure after main integration.
- **Documents reviewed:** `docs/README.md`, `docs/RELEASING.md`,
  `docs/INFRASTRUCTURE.md`, and `docs/planning/PROJECT_PLAN.md`.

## In progress

- **Status:** in progress
- Refreshed all GitHub remote refs through SSH and created the dedicated
  `chore/all-branch-integration-v2026.09.26` integration branch from latest
  `origin/main`.
- Classifying every remote branch by ancestry, unique commits, changed paths,
  migration sequence impact, and available evidence before any merge.
- The first current-main simulation found seven branches already contained;
  twelve candidates with a clean tree merge; and thirteen candidates that
  conflict with current main. Several old automatic branches are nested
  supersets of earlier branches and must be integrated at most once.
- Re-read documentation governance and branch-drain records. A clean Git tree
  merge is not validation evidence: stale code and planning changes still need
  current-main reconciliation and exact-head checks.
- Confirmed the approved Debian SSH path is reachable with key-based,
  read-only access (`hostname` only). No runtime or Production action occurred.

## Finished

- **Status:** pending
- Record included/excluded branches, conflict resolutions, exact validation
  output, final main SHA, and Test/Production deployment state here.
