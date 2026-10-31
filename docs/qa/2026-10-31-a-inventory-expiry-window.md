# QA — Development A Owner Inventory Expiry Window (2026-10-31)

**Decision: CODE TESTED / RELEASE HOLD.** Baseline main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`; code SHA `d4bc49a9e7920faaf8a6bd6fa6e3bbb70c856ad9`; Draft PR #2214.

- TDD RED: backend 1 FAIL/2 PASS; frontend 2 FAIL/3 PASS. GREEN: backend 3/3, frontend 5/5.
- Full backend Vitest: **2,787 PASS / 501 SKIP / 0 FAIL** (372 files passed, 97 skipped). Full frontend Vitest: **2,781 PASS / 0 FAIL** (529 files). Serial single-worker execution.
- Contract build, Nest/Next typecheck: PASS. Target ESLint: 0 errors / 10 existing warnings. Backend and frontend production builds: PASS.
- Android gateway: invalid/duplicate filter 400 before upstream; unverified HTTP 200 -> 503; private/no-store/noindex/no-referrer. 184 mobile endpoints; generated English/Korean contract references included.
- Real DEV PostgreSQL 17.11 READ ONLY transaction under `moneyverse_app`: parameterized 7d/30d SQL executes for nonexistent actor, 0/0 rows, ROLLBACK. Synthetic SQL expression samples (1/8/31 days and null) yield 7d=1, 30d=2. **No seeded nonempty owner E2E proof.**
- **P0 FAIL:** DEV app role effective SELECT=true and DELETE=true on `public.user_items` (#993). Does not prove Production ACL.
- First code SHA CI failed on generated mobile contract/schema drift; generated docs included in final commit. Exact final SHA CI must be rechecked.
- Official isolated Test candidate SHA, authenticated owner/consent E2E, independent backup restore, finance provenance, GitOps release gate and complete security/a11y/SEO checks: **BLOCKED / NOT PROVEN**. No main merge, deployment, service restart, production DB write or rollback.

Host evidence: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-2225-inventory-expiry/`. No applied migration modified.
