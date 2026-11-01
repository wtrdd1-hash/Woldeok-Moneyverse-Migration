# Backend B v739 — Admin monetary policy mutation CSRF and console-session boundary

## Before work (2026-11-02 02:43 KST)
- Base `origin/main`: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.
- Isolated branch: `auto/hourly-b-v739-monetary-admin-csrf-20261102-0235`.
- Reviewed `AGENTS.md`, `README.md`, both `docs/planning/PROJECT_PLAN*` masters, QA v1452, open PRs and CI. Existing dirty root checkout untouched.
- Scope: admin monetary policy state-changing POST endpoints currently have only session, authentication, consent and role guards; no CSRF or open admin-console session requirement. Admin finance policy changes must not be accepted with only a role-bearing browser cookie.
- No overlap with current monetary controller PR. Other teams own frontend and app API; direct `/api/v1` browser mutation calls need separate UI integration and cannot be treated as working.

## Plan / in progress
1. RED: add real Nest HTTP regression for missing/invalid CSRF, absent admin console and valid same-session admin action; preserve safe GET behavior.
2. GREEN: require `AdminSessionGuard` and `CsrfGuard` on all monetary policy POST endpoints; preserve GET, API schema and SQL.
3. Verify focused security tests, lint/typecheck/build, full regression and isolated PostgreSQL as available. Check latest main/plans again before PR.
4. Publish Draft/HOLD PR, explicit release blockers, and frontend integration handoff; no merge or deploy without all gates.

## Finished
Pending.

### RED checkpoint
- Actual Nest HTTP test `monetary-admin-csrf.http.test.ts`: **17 failed / 1 passed** before implementation, with missing/invalid token accepted or returned 503 from unguarded financial HOLD routes. No financial service mock should be invoked by denied requests. The positive test also proved no admin-console touch was performed.

### In-progress checkpoint
- Implemented method-scoped `AdminSessionGuard` then `CsrfGuard` on eight POST routes; GET stays on existing role/consent checks. No DB, finance ledger or API payload modifications.
- Focused suite initially exposed Nest testing-module injection failure in two pre-existing HTTP fixtures. Added `SessionRepository` mock provider only in those fixtures; all 136 focused tests then passed.
- TDD GREEN: new 18/18 HTTP tests PASS. Full typecheck PASS. Full lint PASS (0 errors, 1,027 pre-existing warnings). Backend/frontend build PASS.
- Frontend `monetary-bureau-card.tsx` still calls direct `/api/v1/admin/economy/monetary/*` from the browser without CSRF. This PR does not claim a working end-to-end admin mutation flow; a separate frontend owner must integrate authenticated server action and session token.
