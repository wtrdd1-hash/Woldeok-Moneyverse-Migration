# A1457 QA / Release decision — PARTIAL / BLOCKED

**Scope:** P1 wallet history keyset pagination across NestJS, PostgreSQL SELECT, Next.js, Android app-api. Code SHA `9fb1fdf8a7167e7fed84f70098826a095a856b8b` rebased onto main `9ff388ab608af99b9ccc806c35ebac5c14bd15e9`. Final report commit SHA is in Draft PR #1703.

**Evidence:** Backend 1,939 PASS/441 SKIP; Frontend 1,870 PASS; database 45 PASS/3 SKIP; Bot 11 PASS; focused backend 5, frontend/Android 30, isolated PostgreSQL 17 PASS; root full test PASS; lint 0 errors/1,095 warnings; typecheck, backend build, Next webpack build retry, mobile contract 180 PASS; root audit 0 high/critical, bot audit 0. Initial bot failure was missing local deps then resource exhaustion, resolved with offline install and single-worker rerun; initial Next build timeout at tracing, successful clean retry.

**Safety:** No new grants, applied migrations, financial mutations, deploy, merge or rollback. Read-only app SQL relies on existing grants; historical app role broad DML (235/241) and PUBLIC bank EXECUTE are still unremediated P0, not certified away by a synthetic fixture. Signed cursor is bound to owner/session/period and expires after 1 hour; `asOf` is a time bound, not a cross-request database snapshot. Page navigation replaces the 50 displayed rows and does not imply complete CSV export.

**Repository:** start 36 remote branches (including main) / 34 open PR; end 39 / 36, all Draft, 2 conflicts, 17 failed checks, 0 duplicate head SHA; 352 recovery refs valid; 0 deleted branches. Main changed during run and was rebased. Other workers' changes preserved.

**Release:** Official Test symlink resolves to SHA `4688e84be0f8`, not candidate; candidate exact-SHA authenticated Test wallet/login/API/DB E2E, independent restore, applied-migration checksum parity, GitOps authorization and production version validation remain BLOCKED. No PASS evidence for deployment. **Production RELEASE HOLD**.
