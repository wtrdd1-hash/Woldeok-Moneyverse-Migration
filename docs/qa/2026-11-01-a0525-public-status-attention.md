# A 05:25 Status Attention — QA Evidence (In Progress)

- Scope: read-only status attention filter on Nest, Next, Android app-api and existing PostgreSQL SECURITY DEFINER function.
- TDD: backend 2 and frontend 4 RED then GREEN; targeted backend + frontend 27 PASS.
- DB: DEV PostgreSQL 17.11, role `moneyverse_app`, `content_public_status()` 3 rows, attention 0, transaction ROLLBACK; not a synthetic outage scenario.
- Typecheck PASS; lint 0 errors / 1,022 existing warnings.
- Full test/build, exact-SHA CI, Test E2E, backup restore and release proof pending. **RELEASE HOLD.**
