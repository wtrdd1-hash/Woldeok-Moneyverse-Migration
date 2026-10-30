# Backend B v657 — Public NPS Overview Least-Privilege Read

## Before work (2026-10-30 12:35 KST)
- [x] Read AGENTS, README, canonical and Korean planning, open PR/QA/CI; main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`.
- [x] Isolate worktree; stack on B v656 Draft #1987 because immutable migration 307 is pending. New migration 308 must not be applied alone.
- [x] Reproduce public NPS overview denied direct table SELECT under application role.

## In progress
- [x] RED: regression rejects direct `national_pension_accounts`/vault table SELECT in public overview.
- [x] GREEN: SECURITY DEFINER read-only aggregate function; app role EXECUTE only; no direct table grants.
- [x] Real isolated PostgreSQL least-privilege tests; backend focused HTTP and unit tests.

## Finished
- [ ] Final SHA, changed files, gate results, upstream main check, PR and release decision.

**Scope:** Public NPS aggregate only. Member account reads and protected writes are not claimed fixed. Never mutate balances, pensions, ledger or shared DB.

### Implementation checkpoint
- RED: 2/2 new unit tests failed on direct SQL and missing-vault false zero.
- Added migration 308 aggregate SECURITY DEFINER function with EXECUTE limited to application role, no direct table grants.
- Replaced direct public overview SELECTs with scoped function and missing/invalid evidence 503; financial write paths unchanged.

### Verification checkpoint (2026-10-30 12:46 KST)
- API: `GET /api/v1/pension/overview` and `GET /api/v1/admin/pension/overview` keep their response field names; only the repository read source changes. Missing `VAULT_MAIN` or malformed aggregate returns 503 rather than an invented zero. No member account endpoint is fixed in this scope.
- DB: new `public.pension_public_overview()` returns five text/bigint aggregate fields. No direct table SELECT grant, no pension write permissions, no ledger/treasury mutation. Forward-only 308 depends on unmerged 307 in Draft #1987.
- TDD: new repository tests RED 2/2 before implementation; GREEN 2/2 afterward. Existing precision regression adjusted for the new single-query contract; 7/7 targeted precision+ACL PASS.
- Isolated PostgreSQL 17.11: PASS with network-disabled disposable container; direct table SELECT denied, PUBLIC EXECUTE denied, app EXECUTE allowed, huge NUMERIC exact, LIQUIDATED excluded, missing vault null, account row count unchanged. Test container removed.
- Focused pension tests: 15/15 PASS. Database static suite: 56 PASS / 4 SKIP; new migration contract tests 2/2 PASS. API mobile contract: PASS (183 endpoints). Full Typecheck: PASS. Backend build: PASS. Frontend build: PASS on 2048MB heap after first 1024MB OOM and second 49s timeout. Full Lint: 0 errors / 1043 warnings; changed-file Lint: 0 errors / 1 warning. Production dependency audit: no known vulnerabilities.
- Full backend and frontend tests running separately in mv-task; not release certified. Official Test exact-SHA and full migration chain E2E not run; Production remains HOLD.
