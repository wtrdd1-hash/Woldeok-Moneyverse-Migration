# v2026.10.18.806 — Bank Deposit Enrollment Truth and Repair

## Start record (2026-10-18, Asia/Seoul)

- User report: `/bank` '예금 가입하기' does not enroll a real deposit. Investigate from actual button through Next and bank API/ledger.
- Source of truth: `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/features/banking.md`, `AGENTS.md`, and host deployment policy.
- Starting base: origin/main `3cb1040696143a9ae83b7fa96c189feceb505613`; isolated worktree and branch. Other agents and main checkout untouched.
- P0 evidence: `SavingsPotCard` '예금 가입하기' calls `openSavingsPot()` -> localStorage only; no server request, WLD deduction, database contract, or receipt. Simulated interest likewise local-only; `Number(cash) || 50000` misstates zero balance. Actual `/api/v1/banking/deposit` uses `bank_move_balance` and currently has EXECUTE grants for `moneyverse_app` on the development DB.
- Plan: (1) make fixed-term simulations explicitly non-monetary, (2) provide working anchor to actual ledger-backed compound deposit, (3) fix misleading balance and invalid-number checks, (4) add targeted regression tests, (5) run tests/typecheck and safe Test gate. No unverified production claim.
- Safety: do not write to Production DB, do not create fake real fixed-term contracts, do not overwrite a concurrent agent's work; inspect origin/main again before merging.

## Mid-work checkpoint

See time-stamped checkpoint below.

## Final verification and release record (2026-10-18 17:05 KST)

- `pnpm --filter @moneyverse/contract build` PASS, `pnpm --dir frontend typecheck` PASS; Next production frontend build PASS with normal isolated PNPM installation.
- Complete frontend Vitest: **243 test files / 1,274 tests PASS**. Dedicated deposit action tests: 3 PASS (backend path, invalid amount refusal, failed backend response does not claim success).
- Backend banking against isolated Test PostgreSQL: `bank-gameplay.db.test.ts`: **6/6 PASS**, in transactions rolled back. Direct Test SQL also verified exact debit/credit 100 WLD and idempotent replay.
- Targeted ESLint of all touched JS/TS paths PASS with zero warnings; Git diff whitespace check PASS.
- Exact original main base `3cb1040696143a9ae83b7fa96c189feceb505613` checked after test and again before commit; no other agents' worktrees modified.
- **Production readiness is BLOCKED** independently of this UI fix. Read-only `scripts/release/verify-financial-readiness.mjs` with active Production environment returned exit 2: `moneyverse_app` can directly DML `account_balances`, `accounts`, `system_treasury_vaults`; 19 uncertified balance projections (+4,779,188 WLD difference) and 5 balances without postings (+2,627,807 WLD difference). No unauthorized writes to live balances or unsafe permission changes to bypass gate.
- Frontend UI repair does not create server-side contractual 7/30/90-day fixed-term deposits. These remain labeled simulated only; real deposit entry point is the existing ledger-backed `/api/v1/banking/deposit`.
- Code candidate to be pushed to dedicated GitHub branch and reviewed by PR; Test runtime must be staged with matching immutable SHA. Production remains untouched until all required financial, authenticated UI, zero-downtime and session continuity gates pass.

### Artifacts

- Internal/GitHub EN/KO notes: `docs/releases/v2026.10.18.806.md` / `.ko.md`; changelog entries in `docs/changelog/CHANGELOG.md` / `.ko.md`.
- Relevant full frontend / SQL / backend evidence logs on host: `/tmp/bank-v806-frontend-all-final.log`, `/tmp/bank-v806-backend-dbtest.log`, `/tmp/bank-v806-production-finance-gate.json`, `/tmp/bank-deposit-v806-rollback-qa.sql`.


### Mid-work evidence checkpoint (2026-10-18 16:55 KST)
- Frontend regression: 4 relevant files, 10/10 tests pass; full frontend suite 242 files / 1271 tests PASS.
- Frontend TypeScript check PASS; targeted ESLint found six pre-existing unused imports; cleaned them in the candidate.
- Rollback-only banking mutation probe on isolated `woldeok_moneyverse_v506_test` (NOT Production): member cash `1000 -> 900`, bank `250 -> 350`, same idempotency key returned one identical `transaction_id`, successful `ROLLBACK`.
- Build attempt FAILED before compilation because temporary worktree `frontend/node_modules` symlink crossed Turbopack root, unrelated to feature code. Fixing test-only dependency installation in isolated worktree; no active release changed.
- Observed production backend database name `woldeok_moneyverse_dev` and Test backend separate `woldeok_moneyverse_v506_test`. Never run mutation probes against Production.
