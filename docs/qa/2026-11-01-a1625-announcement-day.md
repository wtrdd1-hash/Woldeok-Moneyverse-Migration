# A 2026-11-01 16:25 — Public announcement Seoul-day search QA

**Verdict: P1 CODE IMPLEMENTED / TARGETED PASS / FRONTEND FULL PASS / BACKEND FULL 2 FAIL / REAL DEV POSTGRESQL READ PASS / RELEASE HOLD.**

## Source and change
- Canonical main: 1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0 (rechecked start, mid and before final documentation); isolated auto/hourly-a-20261101-1625-announcement-day branch, Draft PR #2347.
- New GET day=YYYY-MM-DD filter for recent published public announcements, web, Nest public/app content controllers, PostgreSQL function result filter, and Android app API. Strict KST calendar boundaries and validation, verified response day echo, no-store/noindex filtered results and accessible date form. Searches the **latest 20** only.
- No new migrations, ledger writes, table grants, direct production changes or new privileged routes. Other developers' worktrees and PRs preserved.

## Executed evidence (Debian 13.6)
- RED before implementation, then GREEN backend focused 21 PASS and frontend focused 5 PASS. Added server-rendered page/metadata regression: 3 PASS. Final focused frontend parser+app-api+page: **8 PASS**.
- Full backend with bounded single worker: **2,974 PASS / 2 FAIL / 518 SKIP**, 187.51s; two profile-private-response HTTP cases expected 200 but received 401. These are outside changed content paths and match previously reported profile-auth blocker; no baseline re-run in this report, so do not certify full backend PASS.
- Full frontend with explicit NODE_ENV=test and one worker: **2,910 PASS / 0 FAIL**, 249.28s. An earlier run under inherited NODE_ENV=production failed 496 tests (React.act undefined); that run is invalid as a passing gate and retained in evidence.
- Database unit: PASS (see logs/database-unit.log). Security focused: PASS. Typecheck: PASS. Backend and Next frontend builds: PASS. ESLint: 0 errors, 1,022 warnings. Android API contract check: PASS, 184 endpoints.
- Real DEV PostgreSQL 17.11 read-only app-role validation from this cycle: 2026-10-14 KST publication day 1 matching notice, adjacent day 0, existing SECURITY DEFINER function EXECUTE allowed. DEV app role also had direct SELECT on public.announcements: **P0 least-privilege finding**, not proof of production privilege state.
- Prior exact code SHA 601e0e0684786569cfc21f84d8a5b60c7c94c90f: GitHub CI SUCCESS, candidate image workflow SUCCESS; the final documentation/test SHA requires fresh CI checks.

## Release safety and branch audit
- Public Test backend/frontend both bc8cd8a6c654af0336f550643f23049a58ee1d16, not candidate. Production backend 353c6d5d6ddbc14b1067e84f9c4a127bab1c3834; frontend build ID 1793450413898 (not verifiable source SHA).
- Exact-SHA isolated Test auth/user-flow E2E, independent restore, P0 DB ACL remediation and GitOps gate not PASS. **Do not merge or promote.**
- Start remote branches 110 incl. main / 101 open PR; final audit 113 incl. main / 104 open Draft PR, 22 conflicts. 106 non-main branches have unique commits; 6 ancestor/equal refs retained because ownership/integration not independently proven. Deleted 0 branches; no main merge, Test/Production deploy, service restart, production DB mutation or rollback.
- Logs: /srv/moneyverse-data/tasks/mv-a-20261101-1625-announcement-day/logs/. Full gate evidence is attached by task path, not a release certificate.
