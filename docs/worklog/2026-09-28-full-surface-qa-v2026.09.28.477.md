# Full Surface QA Worklog — v2026.09.28.477

> Status: IN_PROGRESS
> Start date: 2026-09-28
> Branch: `qa/full-surface-v2026.09.28.477`
> Start `origin/main`: `44933fd7abe83284e067c85115bf7ac1033cc895`
> Mid-work `origin/main`: `44933fd7abe83284e067c85115bf7ac1033cc895` (no drift observed)
> Android app baseline: `wtrdd1-hash/woldeok-moneyverse-app@44288fccb321b5df889ca099989cb9afd350979c`

## Authority reviewed before execution
- `docs/DOCUMENTATION_POLICY.md`
- `docs/planning/INTEGRATED_PLANNING_MASTER.md`
- `docs/CURRENT_RUNTIME_BASELINE.md`
- `docs/QA_AUDIT_REPORT_V473.md`
- `docs/planning/FULL_ROUTE_UI_QA_SPEC.md` and Korean counterpart
- Current root/frontend package scripts and latest main release history.

## Scope
QA all current web user routes, all administrator routes, dynamic-route fixtures, responsive/browser surfaces, frontend/backend/static checks, API contract coverage, runtime health, session-continuity-sensitive behavior, and Android app compile/test/API-surface checks. v473 evidence is historical only; v474–v476 additions must be reverified.

## Start record
No code or runtime mutation was made. Production promotion is not implied. Any defect requiring code changes must be fixed on a dedicated branch from the latest rechecked main, verified on Test, and only then considered for zero-downtime Production promotion.

## Mid-work record
- Exact source inventory is now **108 pages / 24 administrator pages / 12 dynamic pages**, inventory SHA `922ce3006e61ec6c9f81e473e457594901b881418a522755663eaad4ec1cea01`. The historical v442 snapshot (86/22/8) and v473 30+ route / 11-admin report cannot prove current coverage.
- Typecheck and Production build pass on exact main.
- Root lint fails with **89 errors / 364 warnings**.
- Root test gate fails because generated mobile API contract evidence drifts by **84 insertions across 3 maintained files**; the generated schema adds nullable `authorUserId` fields.
- Direct package tests: contract 23/23 pass; database 7/7 pass; backend 1,018 pass with 391 DB-dependent tests skipped. Frontend has 927 pass / 1 fail plus 6 unhandled post-test errors; the failing assertion requires missing `references/corpus-150k.json`.
- Production/Test services are active and both backend health endpoints return 200. Active symlinks resolve to `prod-v476` and `test-v476`.
- Browser five-pass guest sweep is running against Test. Early passes show zero horizontal overflow but intermittent route failures and many console/request-error rows; privileged/member acceptance is not claimed because live `qa_admin_v1` / member fixtures are not available.
- Android exact-main unit tests and lint pass after restoring the SDK path into the isolated worktree. APK assembly remains blocked locally by the intentionally unavailable signing keystore, and no online emulator/device is currently available for instrumentation/UI acceptance.
