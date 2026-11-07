# A 2026-11-01 19:25 KST — Pinned public announcements QA

**Branch:** `auto/hourly-a-20261101-1925-announcement-pinned`
**Base main:** `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`.
**Status:** P1 implementation; RELEASE HOLD. Code SHA CI #41298689388 and candidate build #41298309505 were IN PROGRESS at 19:43 KST; official Test E2E not certified.

## Tested
- TDD red and green: backend repository SQL/function boundary, strict duplicate/invalid query, both Nest controllers; web feed source and fail-closed pinned response; Android gateway rejects invalid query and unverified HTTP 200. Target backend 4 PASS, frontend 5 PASS.
- Backend and frontend typecheck PASS. Backend and frontend build PASS on exact code SHA c2f74533.
- Backend full suite on exact code SHA c2f74533: 2,965 PASS / 2 FAIL / 518 SKIP. Existing profile HTTP 200-versus-401 tests failed; do not claim full PASS.
- Frontend full suite with correct NODE_ENV=test on exact code SHA c2f74533: 2,907 PASS. Initial run without NODE_ENV=test: 496 FAIL; environment-only, re-run with proper environment PASS.
- DB unit 62 PASS / 4 SKIP; lint 0 errors / 1,022 warnings; app contract 184 endpoints PASS; advisory security tests 11 PASS.
- Real DEV PostgreSQL 17.11: `moneyverse_app` READ ONLY + ROLLBACK; function EXECUTE true, latest 20 published=1, pinned=0; exact SQL query executed. Positive pinned data case unverified.
- P0 ACL: DEV role can directly SELECT announcements, UPDATE account_balances and DELETE user_items. Do not assume Production is affected; see #993.

## Outstanding release gates
- Full final-SHA CI including runtime; official Test exact SHA + authenticated flows; E2E/Android, accessibility/SEO HTTP, independent restore and rollback; P0 ACL, provenance and financial reconciliation. No main merge, Test/Production deployment, migration or privilege changes.
- Other A announcement Drafts touch same files; preserve their unique changes and resolve conflicts only during safe integration.

## Closeout
- Draft PR #2362, code SHA `c2f74533089bcfa6c589636e68007a3b28e6366e`. Test SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`: neither matches.
- Branches start 124 non-main (117 unmerged/7 ancestors), end 125 non-main (118 unmerged/7 ancestors). Open PR 114→115, conflicts 22→22. Deleted 0; unique changes and ownership not yet reconciled.
- Production/Test deploy 0, DB write 0, rollback 0. No exact-SHA official Test, authenticated E2E or independent restore.
