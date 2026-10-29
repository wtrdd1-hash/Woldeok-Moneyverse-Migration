# C v1162 — GitHub release candidate (Draft/HOLD)

The work career-switch server action now confirms the authoritative mutation receipt and the authenticated owner's active-job profile before reporting success. It does not infer persistence from HTTP status. No database schema or financial mutation was changed.

Local evidence: 12 new frontend tests GREEN after observed RED; 1,928 full frontend tests PASS; isolated PostgreSQL 17.11 with 293 migrations and 13 work DB tests PASS; lint/typecheck/build/API-contract PASS. `pnpm audit` remains FAIL (3 low, 9 moderate); official exact-SHA Test E2E and full backend suite are not certified. Do not merge or promote until all release gates are satisfied.
