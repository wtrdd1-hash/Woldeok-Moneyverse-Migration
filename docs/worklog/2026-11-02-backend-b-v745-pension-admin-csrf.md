# Backend B v745 — Administrator Pension Payout CSRF Boundary

**Date:** 2026-11-02 KST
**State:** DRAFT / RELEASE HOLD / PARTIAL (not merged or deployed)
**Priority:** P1 security
**Base:** `a8541927c3a351d980454c66e95a3356c47e0722`
**Branch:** `auto/hourly-b-v745-pension-admin-csrf-20261102-0735`

## Before work

- Read `AGENTS.md`, `README.md`, both project plans (English primary), QA v1457, recent A/C work, open PRs and CI; inspected NPS controller, session/CSRF guards, ledger settlement HOLD and existing HTTP tests.
- The administrator's `POST /admin/pension/distribute-payouts` had role, consent and administrator-console session guards but no CSRF guard. The existing NPS repository blocks unverified settlement before SQL. This change must **not** activate payouts or alter WLD balances.
- No overlapping open pension CSRF PR; owner pension receipt display PR #2314 addresses a different concern. The user-authorized bounded design is to add the existing `CsrfGuard` to this one POST and prove the guard chain at real Nest HTTP level. No new API/DB contract, migration, frontend call or feature flag.

## In progress

- [x] Isolate worktree from latest main and record the SHA.
- [x] TDD RED: missing/invalid CSRF received service's HTTP 503 instead of expected 403 (**2 failed, 4 passed**).
- [x] TDD GREEN: add `@UseGuards(CsrfGuard)` to the payout POST; valid same-session CSRF reaches the still-held financial service (HTTP 503), missing/invalid tokens return 403, locked console returns 401, expired consent 428, read-only GET remains available.
- [x] Update existing GET history-only HTTP fixture to override the newly referenced write guard; the separate new HTTP suite exercises the actual guard and session repository mock.
- [x] Focused NPS suite **20 passed**, post-fixture focused **8 passed**.
- [x] Lint **PASS** (0 errors; 1,027 existing warnings); Typecheck **PASS**; Backend/Frontend Build **PASS**.
- [x] Full frontend **2,922 passed**. Backend **2,984 passed, 2 failed, 518 skipped**: two existing profile privacy HTTP tests expect 200 but receive 401. Full root test **FAIL**. Do not suppress or misreport these failures.
- [x] Contract **41 passed**, database package **62 passed/5 skipped**; Android/mobile app-api **184 endpoints/683 methods** matched; security script **20 passed**.
- [x] Production dependency audit **PASS** (0 known vulnerabilities); full dependency audit **FAIL** (9 vulnerabilities: 8 moderate, 1 low).
- [x] Disposable PostgreSQL 17.11: migration sequence **322 applied**. The first scratch attempt exposed missing migrator table privileges at migration 029; correcting **only the scratch migrator role/default privileges** yielded a full pass. A second independent scratch instance applied all 322 migrations and **44 actual PostgreSQL auth/game/admin integration tests passed**. App role denied direct balance UPDATE, ledger DELETE, NPS account SELECT and NPS payout log INSERT. Containers removed; shared databases untouched.

## Finished / release decision

- [x] Fetch origin/main and recheck both plans and overlapping PRs at mid/final points.
- [x] Retain Draft PR with all unique commits; no branch cleanup.
- [ ] Backend full regression (2 existing profile HTTP failures) — **BLOCKED**.
- [ ] Full dependency audit (9 known development-chain findings) — **BLOCKED**.
- [ ] Official isolated Test exact-candidate-SHA backend/API/DB/auth/core-user-flow and authenticated E2E — **BLOCKED**: public Test and Production `/api/version` both still show `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, not the candidate SHA.
- [ ] All required remote CI and GitOps release gates — **not certified**.
- [ ] Merge to main / Production promotion — **PROHIBITED** until all required gates pass.

**API contract:** `POST /admin/pension/distribute-payouts` now requires the same-session CSRF header; absent/invalid token returns HTTP 403 before service execution. Existing administrator console/session, consent and role checks remain. A valid token does not lift the existing ledger settlement HOLD. GET contracts unchanged. **DB contract:** no schema, migration, privilege or financial data changes.

**Operational safety:** No changes to other A/C/QA branches, shared DB, deployment services, timers, release manifests or production. This is a real code-and-test change, not a documentation-only release.
