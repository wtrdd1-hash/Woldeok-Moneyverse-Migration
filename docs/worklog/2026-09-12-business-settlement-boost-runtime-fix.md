# Worklog — Business Settlement V2 Boost Runtime Fix v2026.09.12.9

## Scope

Repair the confirmed PostgreSQL runtime failure in `business_settle_daily_v2` when an active business boost is present.

## Inputs reviewed

- `docs/planning/PROJECT_PLAN.md` before implementation and again mid-work.
- `AGENTS.md` migration immutability and PostgreSQL SQL-construct rules.
- `178-business-settlement-v2-idempotency.sql` on `main` and all relevant remote branches.
- User-provided runtime defect report reproduced against PostgreSQL 17.11.

The living project plan remained at blob SHA `097f5db3001870a6c1013bb050a734e9d6329965` during this task.

## Version

`v2026.09.12.9`

## Changes

- Added migration `179-business-settlement-v2-boost-runtime-fix.sql` instead of rewriting migration 178.
- Replaced invalid `pg_catalog.coalesce(...)` use in the active-boost path with bare `COALESCE(...)`.
- Added DB regression coverage for active boosts, missing revenue/cost multipliers, and expired boosts.
- Added a CI guard that rejects schema-qualified `COALESCE`, `GREATEST`, `LEAST`, `NULLIF`, and `EXTRACT` in non-legacy migrations.
- Preserved the existing idempotency lock, receipt ownership check, settlement uniqueness rule, ledger postings, and event contract.

## Validation

- PostgreSQL image: `postgres:17.11-alpine`.
- Fresh database migration application: 002 through 179 passed.
- Backend test run with migrator DB access: 62 test files passed, 42 skipped; 837 tests passed, 546 skipped; 0 failed.
- `business-settlement-v2-boost.db.test.ts`: 4/4 passed.
- `business-settlement-v2.db.test.ts`: 2/2 passed.
- SQL-construct guard: passed.

## Deployment note

Migration 178 is already an ancestor of the currently declared Production backend image, while the isolated Test manifest is based on an older application SHA. The fix therefore uses a forward migration and must be promoted through the Test candidate path before Production.
