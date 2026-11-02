# Backend B v752 — Central bank administrator console session and origin boundary

**Status:** DRAFT / RELEASE HOLD. **Base main:** `a8541927c3a351d980454c66e95a3356c47e0722` (checked before and during implementation). This change has not been merged or deployed.

## Verified gap and scope

`CentralBankController` had `SessionGuard`, `AuthenticatedGuard`, `ConsentGuard`, `AdminGuard`, and `CsrfGuard` on the three administrator writes, but omitted `AdminSessionGuard`. An administrator's ordinary authenticated session could therefore reach the policy service without an open administrator console session. This is a missing boundary, not proof of exploitation. `PUT /api/admin/central-bank/policy` in Next obtained a backend CSRF token on the caller's behalf without checking the browser's Origin, which could make that BFF a confused deputy if cross-origin requests reached it.

This PR adds `AdminSessionGuard` after `AdminGuard` and before `CsrfGuard` on `POST /central-bank/mint-batches/:id/accept`, `PUT /central-bank/base-rate`, and `PUT /central-bank/reserve-requirement`. The existing mint hold remains. The Next policy BFF refuses missing/mismatched Origin or non-same-origin Fetch Metadata before any privileged API call. It returns `403 CROSS_ORIGIN_FORBIDDEN` with `Cache-Control: private, no-store`. Public GET endpoints, the authenticated same-origin BFF payload/response shape, ledger, WLD balances, applied migrations, and database schema are unchanged.

## RED → GREEN and verification

- Backend HTTP RED at `cd74c9581e986608b3a94e0280e1ffa86017f61e`: **6 fail / 1 pass** (unguarded policy writes); GREEN after `02875d3584763bc8714046c2da35eb35bcf1415c`: **12/12 pass** including existing durable-policy service tests.
- Next BFF RED at `d1cf47e51948851e03b9bb318d2b91a848aa52c3`: **4 fail / 4 pass** (cross-origin requests accepted); GREEN after `17bf895fd3c4b9481d8d84c2829db530fe45aafe`: **8/8 pass**.
- Pre-BFF-change workspace validation: Typecheck PASS, Lint PASS (0 errors), Backend Build PASS, Frontend Build PASS, Frontend 2,922 PASS, Contract PASS, Database package PASS. Backend full suite **2 FAIL / 2,985 PASS / 518 SKIP**; both failures are pre-existing profile private-response HTTP fixture 401-vs-200, tracked in Draft PR #2265. Final SHA validation and remote CI are required before any merge.
- Disposable PostgreSQL 17.11: 322/322 migrations applied, Treasury/NPS balanced-ledger replay/rollback fixture PASS, 42 DB integration tests PASS. Disposable container removed. No shared DB writes.
- **P0 independent blocker discovered:** `moneyverse_app` had `UPDATE` on `public.central_bank_monetary_policy` and `INSERT` on `public.central_bank_policy_decisions` in a fresh isolated schema; direct policy DML violates the intended SECURITY DEFINER least-privilege boundary. This change does **not** fix that DB privilege issue. Do not claim policy-write end-to-end integrity or authorize release until a separate forward-only function/migration and real role-scoped integration proof exist. See issue #993.

## API/DB contract and release gate

- `PUT /api/v1/central-bank/base-rate` and `PUT /api/v1/central-bank/reserve-requirement`: administrator role **plus open console session plus valid session CSRF** required. Missing console -> 403; locked console -> 401; valid authorized requests preserve existing response contract (actual DB-backed success not certified here).
- `POST /api/v1/central-bank/mint-batches/:id/accept`: same guard chain, but financial operation still fails closed with existing 503.
- Next BFF: missing/cross-origin browser Origin -> 403 with no backend call; same-origin request still obtains session CSRF and forwards the existing DTO.
- No DB schema, financial posting, migration, or ledger changes. **RELEASE HOLD:** profile tests, direct policy DML privilege, official exact-SHA Test, authenticated E2E, independent restore, all required CI and GitOps release gates not certified. Do not merge or promote Production.

**Evidence:** miniPC task logs under `/srv/moneyverse-data/tasks/mv-b-v752-central-bank-admin-session-20261102-1235/logs/` (start, mid, RED/GREEN, full suites, isolated PG, end). Collaborator worktrees, Production, Test, shared databases, and existing scheduled tasks were not modified.
