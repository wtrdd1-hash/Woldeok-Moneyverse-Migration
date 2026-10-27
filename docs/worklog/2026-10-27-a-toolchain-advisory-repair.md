# A security toolchain advisory repair — 2026-10-27

## Before work
- Baseline main: `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`; branch: `auto/hourly-a-toolchain-security-20261027-1955`.
- Scope: remediate critical Vitest/tinypool advisories and associated high severity lockfile findings without altering database migrations, financial ledger or production services.
- Evidence: fresh root audit reports 2 critical, 8 high; bot audit reports 1 critical, 5 high. The independent Bot transitive tar issue is out of scope; no false release certification.
- Other A notification worktree and B/C/Gemini workspaces are protected; no edits there.

## Plan
1. RED: add and run a toolchain dependency floor test against the current lockfile.
2. GREEN: update the four workspace Vitest dependencies and peer toolchain safely, regenerate lockfile.
3. Verify focused/full tests, typecheck, build, lint, audits and CI. Record failures, do not merge without full gates.
4. Recheck main and current integrated plan before any PR; keep Draft/HOLD if any required gate fails.

## In progress
- RED: two dependency floor tests failed against main (Vitest 3.2.7 / tinypool 1.1.1).
- GREEN: Vitest 4.1.11, Vite 7.3.7, plugin-react 5, fast-uri 3.1.8, brace-expansion 1.1.20/5.0.11; preserve Zod 4.6.7.
- Vitest 4 removed environmentMatchGlobs/minWorkers: replaced with named jsdom/node test projects and removed deprecated worker option.
- Backend 1,544 PASS/412 SKIP; Frontend 1,485 PASS; contract 38 PASS. Main DB migration parity fails duplicate 280 (unrelated PR #1564).
- Root audit improved 2 Critical/8 High -> 0 Critical/0 High (moderate remains); Bot still 1 Critical/5 High.
- Typecheck, lint, backend and frontend Webpack builds, Android app-api 179 endpoints and Bot 8 tests PASS after isolated Bot dependency install.

## Finished — candidate only / release HOLD
- Root dependency audit before: Critical 2, High 8, Moderate 11, Low 3. Candidate: Critical 0, High 0, Moderate 8, Low 2; full unfiltered audit still exits 1. Production-only high-severity audit exits 0.
- TDD: Vitest floor tests RED 2 -> GREEN 5 (including existing Zod floors). Vitest 4 jsdom/node project routing corrected after first frontend run failed 384 tests; final frontend 1,485 PASS, backend 1,544 PASS/412 SKIP, contract 38 PASS, bot 8 PASS.
- Typecheck PASS, lint PASS with 1,122 existing warnings, backend Nest build PASS, Next Webpack build PASS, app-api contract 179 endpoints PASS, repository security/control-byte/Prisma guards PASS, route-ledger unit 3 PASS.
- Full root test FAIL at pre-existing duplicate main migration 280 (280-qualification-ledger-settlement-hold.sql and 280-verified-help-center.sql). Independent Draft #1564 addresses numbering; do not edit an applied migration or duplicate that work. Official exact-SHA Test/real-PG/auth E2E, full five-pass route ledger, browser a11y/SEO and independent backup restore remain BLOCKED.
- pnpm 10.0.0 frozen-lockfile parity PASS. Bot audit remains Critical 1/High 5, no unsafe transitive tar override.
- At review: main 59cdc2e02f0e83e5401049309c4cb89ff57c2d4c unchanged; 363 remote branches (362 non-main), 353 open PRs (338 Draft), 65 conflicts, 210 with failed/cancelled checks; 0 duplicate head SHA. Branch ancestry: 352 diverged, 6 ahead, 4 main ancestors. Deleted 0: all unique work and active owners preserved.
- Test public version 6f697e74b7bf0cd1e4521d36534cfd9c140f8010, Production public version 6a989b5ac0c6155587d43426d64f6def6b62c917; neither matches candidate. No main merge, DB/ledger write, feature activation, Test/Production deploy or rollback.
- Rollback for an unmerged candidate: close Draft PR, preserve evidence, delete branch only after verifying no unique unmerged changes. If integrated later, revert package/config changes and rebuild via authorized GitOps; no schema migration rollback.
- PR must remain Draft/HOLD until all security, migration, exact-SHA Test, auth, backup and GitOps release gates pass. This is a security remediation candidate, not a completed P0/P1 user-facing Full-stack feature.

