# A 2026-11-01 19:25 KST — Pinned public announcements QA

**Branch:** `auto/hourly-a-20261101-1925-announcement-pinned`
**Base main:** `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`.
**Status:** P1 implementation; RELEASE HOLD. Exact-head CI and official Test E2E are not certified.

## Tested
- TDD red and green: backend repository SQL/function boundary, strict duplicate/invalid query, both Nest controllers; web feed source and fail-closed pinned response; Android gateway rejects invalid query and unverified HTTP 200. Target backend 4 PASS, frontend 5 PASS.
- Backend and frontend typecheck PASS. Backend and frontend build PASS (before final web fail-closed helper; re-run required on final SHA).
- Backend full suite on feature code: 2,964 PASS / 2 FAIL / 518 SKIP. Existing profile HTTP 200-versus-401 tests failed; do not claim full PASS.
- Frontend full suite with correct NODE_ENV=test on earlier candidate: 2,906 PASS. Initial run without NODE_ENV=test: 496 FAIL; environment-only, re-run with proper environment PASS.
- DB unit 62 PASS / 4 SKIP; lint 0 errors / 1,022 warnings; app contract 184 endpoints PASS; advisory security tests 11 PASS.
- Real DEV PostgreSQL 17.11: `moneyverse_app` READ ONLY + ROLLBACK; function EXECUTE true, latest 20 published=1, pinned=0; exact SQL query executed. Positive pinned data case unverified.
- P0 ACL: DEV role can directly SELECT announcements, UPDATE account_balances and DELETE user_items. Do not assume Production is affected; see #993.

## Outstanding release gates
- Full final-SHA CI including runtime; official Test exact SHA + authenticated flows; E2E/Android, accessibility/SEO HTTP, independent restore and rollback; P0 ACL, provenance and financial reconciliation. No main merge, Test/Production deployment, migration or privilege changes.
- Other A announcement Drafts touch same files; preserve their unique changes and resolve conflicts only during safe integration.
