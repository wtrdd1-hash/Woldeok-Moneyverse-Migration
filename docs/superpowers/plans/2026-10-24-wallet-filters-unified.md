# Wallet activity unified filters — development A
1. Preserve main baseline and independent A PRs; collect their source and tests.
2. Compose direction/category/period query DTO, Nest controller/service/repository and owner-scoped PostgreSQL read (all predicates before LIMIT).
3. Compose BFF + Android app-api propagation, privacy cache headers and accessible UI controls.
4. Add combined-filter regression and owner-scope/invalid-input tests (RED then GREEN).
5. Run lint/typecheck/build/unit/integration/real-PG/security/app-api/E2E gates; re-fetch main and record exact SHA, CI, branch retention, release HOLD unless all PASS.
