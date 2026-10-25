# Member business ownership snapshot export — engineering plan

Base: main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
Scope: P1 authenticated, owner-scoped **current** virtual business holdings CSV, not settlement or ledger receipts. Avoid C supply-chain, B database migrations and Gemini planning.

1. RED: add backend controller/service contract tests for owner-derived actor, fail-closed >100 holdings, and no financial writes.
2. GREEN: reuse existing `business_my_ownerships_v2($1)` owner-scoped PostgreSQL function via BusinessService, return `{scope:'current_100_max',businesses}` with no direct table access.
3. RED: add CSV validator tests for UUIDs, integer strings, bounded count, injection and timestamps; guest/503/no-store response tests.
4. GREEN: add private Next route and keyboard link on `/businesses`; add app-api gateway regression test and ensure backend response headers prevent native cache/indexing.
5. Verify isolated PostgreSQL `moneyverse_app` function EXECUTE and negative direct DML, rollback; run backend/frontend focus, typecheck, lint, build, full suites, audit, Android contract and exact SHA CI. Any failed required gate => Draft/HOLD, no merge/deploy.
6. Re-fetch main/plans before integration, preserve all unique other branches, record evidence and release hold.
