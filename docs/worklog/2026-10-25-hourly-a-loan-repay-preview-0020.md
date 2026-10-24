# Development A — Loan Repayment Preview (2026-10-25 00:20 KST)

## Before work
- State: IN PROGRESS. Baseline main: `c9a868b1e622341e2daa8b936ddf0988eda9988e`; branch `auto/hourly-a-loan-repay-preview-20261025-0020` in independent worktree.
- Debian 13.6 reachable; backend/frontend/MCP/Nginx/Docker active; DB connection reported; disk at 97%, so no broad dependency installation or destructive cleanup.
- GitHub remote 83 branches (82 non-main) and 79 open PRs at start; previous A #1191, QA #1190, B #1192, C #1193, planning #1195 unmerged; preserve unique changes. Previous frontend regression 5–6 failures, dependency security and official exact-SHA Test blockers; no branch deletions.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, INTEGRATED_PLANNING_MASTER.md and .ko.md, prior release/QA and GitHub CI. Main policy protects SQL SECURITY DEFINER, no applied migration edits, no production writes.
- P1 feature: member-only, read-only loan repayment preview from owner-scoped `bank_get_my_standing`, exact integer-string math and truthful non-execution; existing repay form has no preview. No overlap with open A loan history/detail, B loan mutation/security, C app work.
- Contract: GET /api/v1/banking/repayment-preview?amount=<positive integer string>, own active loan only; include requested/effective amount (database policy caps overpayment), projected cash/debt, eligibility reason and non-binding disclaimer. No writes. Next member-only /bank/repayment-preview; Android gateway inherits /banking/* routing.
- Safety: amount validation, fail closed on unavailable standing, no loan/other actor denial, no fake success; no migrations, no direct table reads, no Number() monetary conversion; execute existing repay endpoint separately with fresh server validation.

## Plan
1. Add focused failing tests for calculation, error handling, controller and gateway contract.
2. Implement backend pure calculation, authenticated GET and browser member-only preview UI linked from loan card.
3. Verify focused tests, lint/typecheck/build, backend/DB/frontend suites, security/a11y/SEO/app-api and isolated real-PG read-only role boundary.
4. Re-fetch main and plans, record CI and blockers; Draft PR only if release gates incomplete. No Production promotion or branch deletion without evidence.

## In progress
- Initial isolated worktree created; implementation pending TDD RED.

## Finished
- PENDING.

## In-progress checkpoint 1 (00:26 KST)
- TDD RED: backend repayment preview test could not import missing module (expected failure); frontend initially 3 FAIL due inherited NODE_ENV=production causing React.act unavailable. Re-ran with NODE_ENV=test, 17 PASS.
- TDD GREEN: backend calculation/controller 18 PASS; frontend preview, Android gateway and route 28 PASS.
- Implemented member-only loan repayment preview using existing owner-scoped bank_get_my_standing; bank repayment SQL caps overpayment with LEAST, mirrored exactly with BigInt; no monetary mutations or migration.
- Backend/frontend typecheck PASS, changed-file lint PASS; latest main still c9a868b1e622341e2daa8b936ddf0988eda9988e. Full suite, build, security, isolated PostgreSQL and official Test remain pending.

## In-progress checkpoint 2 (00:40 KST)
- Code SHA 483ebca8a5e0900be725b9117ad094e5cdc52435 after added HTTP boundary regression and early invalid-amount rejection.
- Backend exact code 1,333 PASS / 398 SKIPPED; frontend 1,401 PASS / 6 FAIL; DB 15 PASS / 3 SKIPPED; contract 38 PASS; Android app-api 179 endpoint contract PASS. Focused backend 20 PASS and frontend 28 PASS.
- Backend/frontend typecheck, full lint (0 errors, 1,137 warnings), backend build and alternate Webpack frontend build PASS. Default Turbopack build FAIL on external node_modules symlink. Security audit FAIL (full 2 Critical/10 High, prod 2 High, bot 1 Critical/5 High).
- Isolated real PostgreSQL: 17 active users, 0 active loans, 0 ledger rows; owner standing function PASS as app role, ledger INSERT and Posting UPDATE denied, READ ONLY / ROLLBACK. No Test exact-SHA finance E2E.
- Remote branch and PR audit: 3 conflicting PRs #1143/#1110/#1107; preserve all unique work. No production, no cleanup.
