# QA — Support status summary / HOLD

Scope: member-only latest-100 summary; separate from the unresolved support-status filter PR #1923.

Evidence:
- RED: backend 4 failing assertions, frontend 2 failing assertions.
- GREEN: backend 4/4; frontend+Android 3/3.
- Isolated PostgreSQL 17.11: 304/304 migration files applied; 105 synthetic threads; owner isolation, direct table privilege denial and 100-row cap PASS. Test migrator superuser was an isolated fixture workaround, not production permission parity.
- Typecheck PASS; build PASS after first trace timeout; changed ESLint zero errors; database unit 56 PASS/4 SKIP.
- Full lint FAIL: 3 unrelated stale-tab errors. Mobile contract check FAIL: NPC affinity drift (QA #1927). Backend full 2354 PASS/240 FAIL/493 SKIP. Frontend full run not certified.
- Security: no direct app table grants, no financial writes, no userId input, response validates integer counts and total, private cache/noindex for browser and Android.
- NOT CERTIFIED: exact-SHA CI, official Test authenticated E2E, full accessibility/SEO E2E, independent backup restore, finance release checks.

Do not merge or promote without full exact-SHA release gates.
