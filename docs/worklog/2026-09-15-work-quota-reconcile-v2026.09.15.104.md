# Internal work log — v2026.09.15.104

## Selected runtime improvement

Re-home the still-valid Work daily-quota visibility slice from PR #327 onto the newest reconciled `main` instead of merging a stale branch snapshot. The Work board now renders the authoritative `taken_today / daily_limit` progress returned by `/api/v1/work/tasks` while preserving repeatable-task behavior.

## User benefit

Players can see each task's server-authoritative daily progress at a glance rather than seeing only the number already completed today.

## Baseline and overlap review

- New integration baseline: `3bfa41ce6c251b707254c09f7c3504d1e5245d28` (`main`).
- New branch: `integrate/work-quota-visibility-v2026.09.15.104`.
- Overlapping active work reviewed: PR #327 / `feat/work-quota-visibility-v2026.09.15.103` at `4b51a0a23b87143bcf751638f6b290ff6c1b6f35`.
- PR #327 had successful exact-head repository CI but had diverged from the latest `main` by six commits in each direction.
- The six newer `main` commits were reviewed and are planning/documentation-only; they do not touch the Work runtime files changed by this slice.
- The latest Living Project Plan was read before implementation and again after the integration branch was created. Its P0 fail-closed promotion evidence and profession-work quota-contract findings remain applicable.

## Files and scope

Frontend/runtime:
- `frontend/src/app/work/career-tasks-board.tsx`
- `frontend/src/app/work/work-quota.ts`
- `frontend/src/app/work/work-quota.test.ts`

Documentation:
- this English work log
- Korean parity work log

Backend/API/database contracts are unchanged. The UI continues to consume the existing authoritative Work task read model. No economy mutation, migration, or quota semantics were changed.

## Validation and deployment evidence

The predecessor PR #327 exact head passed repository CI. Its isolated-Test GitOps manifests were pinned to that exact SHA, but the first external exact-SHA smoke run failed because Test never reported that SHA during the verifier window. A retry was started to distinguish reconciliation latency from a persistent cluster/runtime problem.

The v104 integration head is a new immutable candidate and must independently pass secret/security checks, lint, typecheck, build, tests, PostgreSQL/migration parity, Test Candidate image build, isolated-Test exact-SHA/API/database smoke, and rollback-readiness checks before any main or Production mutation.

## Branch audit and cleanup

Application branch count before this integration branch was created: 2 (`main` plus PR #327). Infrastructure branch count observed at audit start: 17.

Deletion-ready infrastructure refs were directly proven for:
- `fix/wdmv-auto-reconcile-v1-catalog-v2026.09.15.103` — fully behind current infra main with no unique commits/files.
- `fix/wdmv-test-candidate-race-v2026.09.14.89` — fully behind current infra main with no unique commits/files.
- `promote/wdmv-test-4b51a0a23b87-v2026.09.15.103` — points to the same commit as infra `main`.

No deletion is claimed: the GitHub connector exposes no branch-ref deletion action and every authorized remote git/gh device was offline. Active draft infra PR branches #22 and #50 are preserved because they retain unique unresolved backup/recovery validation work.

## Blockers, risks, rollback, next priority

Production remains blocked until the newly reconciled candidate is proven on isolated Test at its exact SHA and all required gates pass. If Test continues to miss the declared SHA, cluster/Flux reconciliation must be repaired before Production.

Rollback for this frontend-only slice is a normal revert of the integration/merge commit; no database rollback is involved. The next highest-priority runtime gap after closing the Work quota UI contract remains the Living Plan's P0 promotion-evidence/Test reliability work, followed by the highest-value unresolved user-visible feature slice.
