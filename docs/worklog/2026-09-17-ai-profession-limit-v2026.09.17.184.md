# Internal Worklog — v2026.09.17.184 AI profession assignment-limit control

- Date: 2026-09-17
- Branch: `feat/ai-job-limit-auto-v2026.09.17.184`
- Exact base: `3f523e6708af2bd9d24b60282f26619263a8c53d`
- Scope: backend AI review + forward-only DB migration + planning reconciliation.

## Problem

The living plan described semantic job assignment limits as unlimited-by-default, but runtime migrations 189/190/203 enforce finite `work_task_catalog.daily_limit` values. The economy controller could tune payout caps and repeat decay, but not the actual per-task completion count.

## Implementation

- Added migration `204-adaptive-profession-limits.sql`.
- Preserved `baseline_daily_limit` for every task.
- Registered eight `jobs.assignment_daily_limit_delta.<profession>` knobs with range `-1..+2`, max step `1`.
- Live limits are recomputed from baseline, so repeated policy cycles do not compound.
- Seven-day profession selection evidence drives shortage/overconcentration candidates.
- Hard tightening requires `>60%` profession share, work issuance `>50%`, and repeat decay already `>=25`; low evidence/recovery moves deltas toward `0`.
- Prompt contract advanced to `dual-economy-council-v3`; `daily_limit` changes are high risk and require full rebuttal.
- Existing sample/reconciliation/cooldown/feature-switch/AI-review/rollback gates remain in force.

## Local QA evidence

- Isolated PostgreSQL 17: migrations 002→204 applied successfully.
- Targeted AI + real-DB/economy/work regression tests: 42/42 passed across five files.
- Full workspace typecheck passed.
- Repository ESLint completed with 0 errors and 11 pre-existing `<img>` warnings.
- Full production build passed.
- `git diff --check` passed.

## Release gates

Exact-SHA isolated Test deployment, Test backend/API smoke, same-session continuity where applicable, Production promotion and Production smoke remain required. `BAK-RUNTIME-177-01` remains OPEN; this change is additive/non-destructive and does not claim backup-runtime repair.
