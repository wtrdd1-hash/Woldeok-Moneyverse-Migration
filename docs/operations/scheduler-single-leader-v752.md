# Scheduler writer isolation and single-leader gate — v2026.10.17.752

**Status:** implemented in source, independently tested; **not Production released**. [한국어](scheduler-single-leader-v752.ko.md).

## Actual trigger
During v751 exact-main isolated shadow Test, the backend started using `NODE_ENV=test` and a **disposable synthetic PostgreSQL 17.11 schema-only DB** with 271 migrations. Although SWF, ticker, AI publisher and Discord outbox options were disabled, `SchedulerRunner.onApplicationBootstrap` started generic scheduled DB jobs. Two jobs logged errors; the temporary backend was immediately stopped. Official Test and Production were not switched. Do not infer those synthetic DB job results represent a member DB.

## Code/operational rule
- `SchedulerRunner` starts jobs **only** with `MONEYVERSE_SCHEDULER_ENABLED=true` and `NODE_ENV != test`. Absent, invalid or false values fail closed. `NODE_ENV=test` wins even if environment flag is true.
- One independently designated and reviewed Production leader unit may opt in. All canary, replacement, Test, shadow and previous Production generations must keep scheduler disabled. Provision explicit leader ownership/lease and review real effective environment before starting any candidate; do not rely only on a service name.
- Do **not** set the flag on an unverified application release. Production role grants, 19 uncertified ledger projections, initial balance provenance, authenticated five-pass UI and exact Test session/canary/rollback are independent unchanged P0 holds.
- Other schedulers and cron modules require separate job-owner review. This control covers `SchedulerModule`, not arbitrary cron/ticker/SWF executors. Nginx and live releases/DB were not changed by this patch.

## Acceptance evidence
TDD: RED 3 new cases failed before fix; GREEN 5/5. Full scheduler 15/15. Full backend 1,235 pass, 396 DB tests skipped. Nest build PASS. No source CI, public exact-main Test acceptance or Production release claimed by these local outcomes.

## Recovery
If a scheduled task must run after approved release, explicitly assign exactly one safe Production leader and verify current identity, role, DB schema and checkpoint. Never enable general jobs on an isolated Test just to make a release check pass. Readiness before routing includes verifying no unexpected scheduled writes or external publishing.
