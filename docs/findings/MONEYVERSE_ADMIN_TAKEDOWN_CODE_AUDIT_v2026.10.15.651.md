# Safety / Full-code audit v2026.10.15.651
Status: PARTIAL REMEDIATION / FULL SERVICE BLOCKED.

Baseline: `3634dcf0b07f34a493910e7485a1b508bd35fe48`.
Scope: 1,975 source/config files; 164 Next pages (34 admin); 82 Nest controllers; 270 SQL migrations. Static inventory is not proof every route works.

| ID | Priority | Evidence | Status |
| --- | --- | --- | --- |
| SAFE-651-01 | P0 | `backend/src/safety/safety.controller.ts` required `ReauthGuard`; `frontend/src/lib/mutate.ts` supplied exact screenshot error | Removed extra guard in candidate; admin session/role/CSRF preserved |
| SAFE-651-02 | P0 | migration `226-minor-safety-emergency-takedown.sql` updates case status only; no actual post delete | UI wording corrected, real deletion NOT IMPLEMENTED |
| SAFE-651-03 | P0 | migration 226:216-217 granted ALL on sensitive takedown/age tables to app role | OPEN; require effective-role DB evidence and new forward migration, never rewrite applied SQL |
| SAFE-651-04 | P1 | four calculators link to `/auth/register`, while available page is `/register` | FIXED ON BRANCH with new regression, not yet Production verified |
| SAFE-651-05 | P0 | Production symlink prod-v600; Test v618; public `/api/version` 200 `{"id":"unknown"}` | Exact-SHA Test/Prod verification BLOCKED |
| SAFE-651-06 | P1 | screenshot title/badge vs close button on mobile | Candidate wraps title and reserves right space; device QA pending |
| SAFE-651-07 | P0 | full frontend auth/admin smoke, financial/DB invariants, v530 five-pass UI gate not verified | BLOCKED |

Static audit identified 36 remaining ReauthGuard endpoint uses; these require route-by-route policy review before alteration, not blanket security removal. 42 raw hardcoded href candidates include valid dynamic stock routes and static resources; do not count all as broken.

Server `NODE_ENV=production` caused React 19 `act` to be unavailable in the first frontend full test run (353 failed). Explicit `NODE_ENV=test` re-run is required; the first failure is not proof of 353 functional bugs.

Production data, PostgreSQL, feature switches and release symlinks were not modified. Release requires refreshed main, CI, exact-SHA isolated Test frontend/backend/DB, authenticated admin checks, rollback and zero-downtime continuity evidence.

### Follow-up SAFE-651-08 — stale global verification CTA (branch correction)
- Shared `frontend/src/lib/mutate.ts` retained a non-existent "본인 확인하러 가기" action despite no corresponding button. Replaced with a navigation-independent pointer to real account-security settings **only for genuinely step-up-protected actions**. Added RED/GREEN regression in `frontend/src/lib/reauth-error-copy.test.ts`. This is not blanket step-up removal.
