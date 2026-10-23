# Development A — Wallet uncertain-outcome retry (v2026.10.23.1925)

**Status: IMPLEMENTED CANDIDATE / RELEASE HOLD.** English canonical; [Korean](2026-10-23-hourly-a-wallet-safe-retry-1925.ko.md).

## Authority and isolation
- Debian 13.6 mini-PC direct MCP status and shell connection; Backend, Frontend, Discord Bot, MCP, Nginx, Docker active; development DB connected.
- Starting and integration-preflight GitHub `main`: `f032c4aebd518c8730e56058327ca35f97b4165b` (unchanged at the observed checks). Read AGENTS.md, README.md, English/Korean PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, previous A/QA logs, PRs and CI.
- New isolated branch `auto/hourly-a-wallet-safe-retry-20261023-1925`; worktree `/home/debian/worktrees/mv-a-20261023-1925`.
- **Implementation commit:** `81642bd495585548a03a29c0309b1a6e17e07bde`. This commit has six code/test files. This report and its release record are separate follow-up documentation commits.
- Initial remote branches: 238; initial open PRs: 24. PR #985 conflicting. No branch deletion. Unmerged work in A #990/#995/#1001/#1003/#1007, QA #991 and B/C branches protected. No overlapping source edits to those PRs.

## P0/P1 user task and architecture
A timeout after the database has committed a transfer can make the web UI report failure. The old server actions generated a fresh UUID when a form omitted its key; TransferForm regenerated its UUID after **every** response, including errors. Bank deposits/withdrawals, loans and repayments had no persistent browser keys. Retrying an uncertain operation could therefore submit a *different* command instead of replaying the same idempotency key.

This candidate preserves one browser UUID across failed/uncertain retries for transfers, deposits, withdrawals, borrowing and repayment. Changing input rotates the key; a confirmed success rotates it. Deposit/withdraw have independent direction keys, and repayments have one key per loan. Server actions reject missing/malformed keys instead of silently inventing a new one, and distinguish uncertain network/5xx outcomes from confirmed rejections. The API remains guarded by Session/Auth/Consent/CSRF; backend DTO requires UUID; PostgreSQL existing functions `economy_transfer`, `bank_move_balance`, `bank_borrow`, `bank_repay` all take `p_key uuid`. Android app-api forwards exact JSON WLD integer strings and UUIDs. No ledger write, DB migration, or change to existing economic rules.

**Changed files:**
- `frontend/src/app/wallet/actions.ts`
- `frontend/src/app/wallet/wallet-forms.tsx`
- `frontend/src/app/wallet/safe-retry-actions.test.ts`
- `frontend/src/app/wallet/safe-retry-forms.test.tsx`
- `frontend/src/app/app-api/v1/[...path]/route.wallet-retry.test.ts`
- `backend/src/wallet/wallet-idempotency.dto.test.ts`

## Test and QA evidence
- TDD RED: 10 missing/malformed key assertions failed before the server-action fix; 3 browser form tests failed before UI changes; 5 ambiguous-outcome messages failed before truthful error handling.
- TDD GREEN: 25 focused frontend tests across 3 files; backend DTO 4 tests; `pnpm --filter @moneyverse/frontend typecheck` PASS; workspace `pnpm typecheck` PASS; changed-file ESLint PASS; `git diff --check` PASS.
- Workspace `pnpm build` PASS after offline isolated pnpm install. An earlier attempt with symlinked node_modules failed due Turbopack filesystem-root checks; that was environment setup, not a code regression.
- Full workspace tests **FAIL**: backend 1,307 PASS / 397 DB SKIPPED; frontend 1,392 PASS / 2 FAIL (existing `guest-first-home.test.ts` homepage redesign assertions); contract 31 PASS. No real-DB integration PASS asserted.
- Full workspace lint **FAIL**: baseline wallet CSV `no-control-regex` error, already owned by QA #991. No change to that file.
- Production dependency audit **FAIL**: Next.js 16.3.8, 2 Critical + 1 High. Existing A #1001/QA security owner; no lockfile overlap.
- Development PostgreSQL read-only transaction: 852 ledger transactions, 1,734 postings, 0 unbalanced transactions; 235 public tables allow `moneyverse_app` INSERT. Direct app DML P0 unresolved. No Production DB verification.
- Android app-api contract test verifies unchanged 38-digit WLD and idempotency UUID forwarding; this is a proxy test, not authenticated public Test E2E.

## Release, integration and rollback
- No merge, no official Test promotion, no Production deployment, no DB mutation, no feature switch or schedule change.
- Exact candidate SHA's full CI, authenticated financial E2E, real PostgreSQL replay and negative authorization, complete all-route accessibility/SEO and GitOps release gate remain unverified or blocked.
- Rollback: no runtime mutation. If later integrated, revert the candidate commit on a new review branch; do not alter historical migrations or ledger rows.
- **RELEASE HOLD** until baseline lint/homepage failures, dependency audit, DB least privilege, real replay, and exact-SHA Test/Production authority gates are proven PASS. Draft PR only.
