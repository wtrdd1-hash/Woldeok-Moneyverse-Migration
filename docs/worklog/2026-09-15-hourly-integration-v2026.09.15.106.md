# Hourly integration cycle — v2026.09.15.106

## Selected runtime slice

Re-home authoritative Work daily-quota visibility onto the newest reconciled application baseline after `main` advanced beyond PR #328.

## Baseline and overlap

- newest application `main` before development: `1679fe33a8b276035c4a8fc0ab8e79d42cb2f07c`
- previous validated implementation: PR #328 / `fe14bb14a61dcd6cb7fa277cec7878d46dfac292`
- compare result: previous candidate was 5 commits ahead and 6 commits behind current `main`
- all six newer `main` commits were documentation/planning-only; no newer runtime change touched the Work quota files
- fresh integration branch: `integrate/work-quota-visibility-v2026.09.15.106`

## Runtime scope

- `frontend/src/app/work/career-tasks-board.tsx`
- `frontend/src/app/work/work-quota.ts`
- `frontend/src/app/work/work-quota.test.ts`

Players see server-authoritative `taken_today / daily_limit` progress per task. No backend, API, database, migration, ledger, or economy mutation contract changed.

## Validation and deployment state

The previous exact candidate `fe14bb14...` passed CI and immutable Test Candidate image build, but isolated Test exact-SHA verification failed because the public Test endpoint continued serving an older build. The new candidate must independently pass CI/build/tests and isolated Test exact-SHA verification before merge or Production promotion.

Authorized remote devices were offline at the start of this run, so branch-ref deletion and cluster-level Flux/Kubernetes diagnosis were not available through the remote git/kubectl path.

## Release rule

Production remains fail-closed until the isolated Test endpoint serves the exact candidate SHA, database/API smoke passes, logs show no blocking errors, and rollback readiness is confirmed.
