# A 22:25 P1 QA — Verified announcement source / Draft HOLD

- Baseline main `3d5e321c3d1221febff677469fecdfcb3cf42e7d`; code SHA `982b1b28068acf32f5b9ee9c5c4dcc102ac22562`; Draft PR #2385. No applied migrations modified.
- TDD RED backend 4 FAIL / 2 PASS, frontend 6 FAIL; GREEN backend 6 PASS, frontend 18 PASS.
- Full local: backend 2,976 PASS / 518 SKIP; frontend 2,922 PASS; database 62 PASS / 4 SKIP. Typecheck PASS, backend/frontend build PASS (602 static pages), lint 0 errors / 1,027 warnings. Mobile API contract 184 PASS. SEO/a11y 22 PASS, security/release 14 PASS.
- Production dependencies 0 known vulnerabilities; **all dependencies FAIL: 8 moderate + 1 low**. Full-route QA ledger **FAIL: missing `artifacts/qa/full-route-ledger.json`**.
- DEV real PostgreSQL 17.11, READ ONLY app role: `content_list_published_announcements(20)` EXECUTE PASS, one published row with valid ID/title, ROLLBACK. DEV least privilege **FAIL**: app can SELECT announcements, UPDATE account_balances and DELETE user_items. This does not establish Production grants.
- Public Test backend `e39af10f6a876f56b40b7e5a070cdb3dcb61d699`, Production backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; neither is candidate. Official exact-SHA Test authenticated E2E, independent external restore, GitOps gate **BLOCKED**.
- Branch audit start 144 remote heads/131 PR; later 145 heads/132 PR, 135 unique non-main branches, 10 ancestor/same, 28 conflicting PRs, 0 duplicate tip SHA. No deletion; unique changes and other agents' ownership preserved. No merge or deploy.
- Evidence in `/srv/moneyverse-data/tasks/mv-a-20261101-2225-announcement-source-truth/evidence/`. Code SHA CI pending at initial closeout; final SHA recheck required. **PRODUCTION HOLD.**
