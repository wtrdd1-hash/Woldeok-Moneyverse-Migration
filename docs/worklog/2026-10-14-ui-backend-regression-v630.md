# v2026.10.14.630 — UI/backend regression follow-up worklog

## S1 start
- User: “진행”; use remote mini-PC and v629 PR #833. Authority: AGENTS, DOCUMENTATION_POLICY, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, full audit v628 and remediation v629.
- Independent worktree `/srv/moneyverse-tasks/ui-api-remediation-v630/repo` and new branch `fix/ui-backend-regression-v2026.10.14.630` from v629 `34e2c38d`. Separate baseline worktree at pristine main `d4f9cc19`. Gemini's grant worktree and live releases protected. Execution log `/srv/moneyverse-tasks/ui-api-remediation-v630/execution-log.md`.

## S2 intermediate source verification
- Used same env to compare main full frontend baseline: 38/1169 failures vs v629 39/1173, one old auction regression had already been corrected.
- Traced PR #833 CI runtime-check to mobile API schema artifacts, regenerated three EN/KO contract files, baseline check requires committing them.
- Fixed actual accessibility (green WCAG AA, 44px notification button), administrator floating overlay, notification server `updatedCount` validation, race defense, and React test setup; modernized stale routes/SEO/layout expectations without loosening member-only policies.
- Full frontend 214/214 files, 1173/1173 cases passed. Front and backend TS checks passed; previous v629 source contract 10/10 and backend finance rejection 4/4 passed. Lint 0 errors, 4 warnings.
- GitHub main was unchanged at latest intermediary check. NO DB, live balances, Test/Prod restarts, production/feature switch modifications.

## S3 release evidence
- Commit, publication, CI and Test/Production status are recorded in the host log and PR. Until exactly reproducible CI and dedicated Test frontend/backend/DB acceptance, release gate is BLOCKED.

## S4 backend security verification
- GitHub CI flagged seven backend failures: corrected four stale v629 synthetic-execution expectations (9/9 focused green), isolated three genuine Postgres ACL mismatches to migration 260–269 grants.
- Forward-only migration 270 authored, no backediting applied migrations. The migration cannot be considered accepted until CI's disposable DB tests and independent Test flows pass; runtime may fail closed for newer unaudited direct-write endpoints.

## S5 immutable Test staging, backend smoke and second DB gate
- Exact SHA `8cc33a12fc797833a4f838658d1c3fb1d4d60f63` was built in a clean detached worktree (shared contract → Nest backend → Next standalone frontend) and staged via the immutable host helper to a new Test candidate directory. Old `test-current` and `production-current` were never moved.
- Loopback candidate backend started with **no DATABASE_URL** and an ephemeral test-only internal token: GET `/health` and `/api/version` returned HTTP 200. This proves only DB-less startup/read-only liveness, not full backend/DB integration. Frontend `next start` served 404 for proxy-owned /health routes; standalone server smoke is separate.
- First CI with 270 failed 2 backend tests: remaining treasury_bond_repo_loans DML and unauthorized admin read-model expected SQLSTATE. Revoke remaining direct financial table writes and assert fail-closed 42501. New SHA CI/Test acceptance still required.
