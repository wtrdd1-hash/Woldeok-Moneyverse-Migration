# URGENT full QA and administrator runtime findings — v2026.09.22.335

Date: 2026-09-22
Base plan branch: `docs/qa-defect-tracking-v2026.09.22.334`
Current main: `55cea0ba49fa53e17c924cc54bff5689e2bad172`
Classification: QA/planning evidence only; no deployment performed in this cycle

## Reproduced findings
- Production split release: frontend runs `prod-cd29db4-v336`, backend runs `prod-5cc3641-v328`; `production-current` points to v336.
- Production backend `/api/version` reports `7298bb92d44bd1122cea0929b1d2eb4afbb1a258`.
- Test backend reports the same old build and Test processes run `test-5cc3641-v328`; this is 74 commits behind current main.
- Test public smoke: `/` 200; twelve critical public routes reproduce 500.
- Test admin smoke: ten sampled admin routes reproduce 500; the same Production paths return 200 in unauthenticated HTTP smoke.
- Latest admin security fixes v329/v331/v332/v333 therefore are not proven active in the running backend.
- Frontend admin surface has 20 page routes and 9 direct admin test files; require authenticated route-by-route Test evidence rather than assuming coverage.

## Existing automated evidence
- PR #653 exact head `a0ff5dc2cfc3a30c7810e714018a8e13b2b2fb7f` CI runtime-check succeeded with PostgreSQL service, migrations, lint, typecheck, build, full tests and production dependency audit.
- This does not close runtime findings because the currently running Test/Production backend is a different older build.

## Release decision
URGENT remediation required. Production promotion is blocked until Test is healthy and frontend/backend exact-SHA lineage is coherent end-to-end.
