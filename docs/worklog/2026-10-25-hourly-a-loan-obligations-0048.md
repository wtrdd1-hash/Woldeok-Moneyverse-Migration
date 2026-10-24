# Development A — 2026-10-25 00:48 KST — Loan obligations summary

## Before change
- Debian 13.6 miniPC connected; backend/frontend/bot/MCP/nginx/docker active; DB connected to `woldeok_moneyverse_dev` (production-coupling risk: no writes).
- Remote main `c9a868b1e622341e2daa8b936ddf0988eda9988e` after `git fetch`; local main behind. Root AGENTS/README and `docs/planning/PROJECT_PLAN.md`, `.ko.md`, integrated EN/KO masters reviewed. English canonical, Korean second language. Main QA `v2026.10.24.a0536` HOLD. Latest CI main integration success but not feature release evidence.
- Remote branches: 86 including main; 85 non-main, 82 open PRs; at least PR #1110/#1107 conflict. No branch deleted. Other A #1197 loan repayment preview, B #1196 security, C #1198 account security: do not modify their branches.
- Task P1: add owner-only virtual bank loan obligations summary (active/overdue/repaid counts, outstanding WLD totals) using existing `bank_my_loans` DB SECURITY DEFINER read path, Nest endpoint, Next bank loan tab, Android app-api gateway, regression tests. No DB migration, WLD write, or ledger changes. Fail closed if loan read is unavailable; no stale/fake zeros on fetch error. Canonical integer strings / BigInt, no caching, noindex, session/consent and CSRF guards. New summary is a snapshot, not a repayment promise.
- Design scope: derive aggregates from existing owner-scoped rows, never query all users. Empty list legitimately zero, unavailable database 503. Tests RED then GREEN, verify isolated real PostgreSQL read-only and required gates. No merge/deploy without exact SHA gates.

## In progress
- New isolated worktree from remote main; original main untouched.

## Implementation and TDD evidence
- RED: backend 3 new tests failed because `loanObligations` did not exist; frontend tests failed because card did not exist. Contract built before backend RED.
- GREEN: owner-only summary `GET /api/v1/bank/loans/summary` via existing `bank_my_loans(uuid)`, service BigInt aggregation, `@Header('Cache-Control','private, no-store')`, guarded Next `/bank` loan tab, Android `/app-api/v1/bank/loans/summary` passthrough, focused unit and HTTP route tests. No schema, direct ledger DML or app-role grants.
- Tests: backend focused 26 PASS; frontend focused 13 PASS; full `pnpm test` 1,318 backend PASS / 398 SKIPPED, 15 database PASS / 3 SKIPPED, 38 contract PASS, frontend 1,400 PASS / 6 FAIL (SEO 3, locale 1, login accessibility 1, admin telemetry 1). Full lint 0 errors/1,137 warnings, typecheck PASS, build PASS, Android app-api contract 179 endpoints PASS. `pnpm audit --prod --audit-level high` FAIL: 2 High (body-parser, multer); separate security repair #1097 unmerged.
- Real isolated PostgreSQL `moneyverse-test-db` / `woldeok_moneyverse_ci`: `bank_my_loans(uuid)` exists, `moneyverse_app` EXECUTE granted, direct `virtual_bank_loans` INSERT/UPDATE/DELETE denied, unknown owner read returns 0. Test DB had 0 existing loan rows. A proposed synthetic multi-open-loan fixture failed on database `virtual_bank_one_open_loan_per_user` constraint, and its transaction was aborted (no persistent rows); no further fixture mutation pursued. No official Test authenticated finance E2E.
- Mid main and EN/KO plan recheck: `c9a868b1e622341e2daa8b936ddf0988eda9988e` unchanged. Actual remote branch heads 86 incl main (85 unmerged, 0 merged); local stale remote-tracking refs >1,000 must NOT be treated as live remote branches. 82 open PRs, 3 conflicting. No branches deleted, no other agent worktree touched.

## Integration / rollback gate
- Code is a read-only snapshot: rollback = stop routing endpoint/revert this PR, no migration/data rollback needed. No Test or Production promotion, no GitOps or service restarts. Exact-SHA authenticated user-flow and all CI/security/SEO/a11y gates remain required; until then PR stays Draft and Production RELEASE HOLD.

## After push — exact code checkpoint
- Code + initial reports commit `c4a2ae921f19bd83e51391914db7a7b5a8769bf8`; Draft PR #1199, mergeable but intentionally HOLD. No merge requested.
- Final local verification on code SHA: `pnpm test` FAIL (frontend 6, backend 1,318 PASS/398 SKIPPED, DB 15 PASS/3 SKIPPED, contract 38 PASS); `pnpm lint` PASS 0 errors/1,137 warnings; `pnpm typecheck` PASS; `pnpm build` PASS; `pnpm audit --prod --audit-level high` FAIL (2 High). Android contract 179 endpoints PASS.
- GitHub CI #40109356499 and Test Candidate #40109345307 on code SHA: classify/policy/release-input PASS, runtime pending at checkpoint. These are NOT final gate PASS evidence.
- Actual remote branches after push: 87 incl main (86 non-main; original 85 all retained, plus this new branch). Open PRs 83. Deleted 0; protected unmerged branches retained for unique commits. Latest main still `c9a868b1e622341e2daa8b936ddf0988eda9988e`; EN/KO plans rechecked pre-PR.
- Official Test exact-SHA user/auth/finance E2E, security/a11y/SEO and GitOps release gates NOT PASS. Test and Production NOT promoted. Production DB writes/restarts 0. Rollback: revert this read-only feature PR only; no migrations or ledger changes.
