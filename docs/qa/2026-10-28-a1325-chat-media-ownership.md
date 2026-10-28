# QA A1325 — Chat media access control (DRAFT/HOLD)
Source main a28bed9aa40ff74d492824ae12892a7d52132fdd; original closed PR #1621; recovery branch auto/hourly-a-chat-media-ownership-recovery-20261028-1325.

Positive tests: owner read, legitimate private-chat recipient, support operator with active admin console, upload registration and cleanup, no-cache/noindex Android proxy, no direct app-role registry access. Negative tests: outsider 404 before bytes with no-store/noindex, forged sender cannot authorize, unknown legacy key denied, unauthorized admin denied. Focused Backend 16/16, Android 27/27. Ephemeral PostgreSQL 17.11 fixture and migration 291 PASS with correct migrator ownership. No live database changed.

Complete gates: ESLint PASS with warnings; typecheck PASS; Next production build PASS; API contract 180 endpoints PASS; migration parity PASS; root security audit high+ PASS; Bot tests 11 PASS and Bot audit 0 high+. Full pnpm test FAIL due to pre-existing admin-blog UI/test expectation (1 failure); same Git blobs on main. Frontend accessibility and SEO beyond focused proxy checks, exact-SHA Test login/user E2E, complete real migration stack and independent restore NOT VERIFIED.

Blockers: P0 #993 SQL actor binding/least privilege; legacy media transition; failed full test; official Test and GitOps release gates. No integration or Production release authorization.
