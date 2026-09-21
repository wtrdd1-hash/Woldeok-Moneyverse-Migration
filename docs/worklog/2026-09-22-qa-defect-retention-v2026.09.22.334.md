# QA defect retention and full repository QA — v2026.09.22.334

Date: 2026-09-22
Scope: planning/docs + QA evidence only; no runtime change or deployment
Base: `origin/main=55cea0ba49fa53e17c924cc54bff5689e2bad172`

## Change
- Added an authoritative defect-retention rule: every failed, skipped, degraded or blocked QA finding remains tracked until exact-SHA retest closure.
- Added mandatory defect fields, lifecycle and Production blocking rules.
- Recorded current open findings `QA-334-01` and `QA-334-02`.

## QA evidence
- `pnpm lint`: exit 0 with 12 warnings (11 unoptimized `<img>` warnings, 1 React Hook dependency warning).
- `pnpm typecheck`: exit 0.
- `pnpm test`: exit 0; API contract check generated/verified 159 endpoints; frontend 707/707 passed; backend reported 907 passed and 361 skipped DB-dependent tests.
- `pnpm build`: exit 0; backend and Next.js production build succeeded.
- DB skip cause confirmed in source: DB suites use `describe.skipIf(!DATABASE_URL)` and/or `describe.skipIf(!MIGRATOR_DATABASE_URL)`.

## Release status
Documentation-only cycle. Production promotion is not requested. Real-DB QA remains a P1 blocker for any runtime promotion relying on this QA evidence.
