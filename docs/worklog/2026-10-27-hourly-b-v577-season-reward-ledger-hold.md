# Development B v577 — P0 season reward ledger containment

Date: 2026-10-27 KST. Status: **PARTIAL / BLOCKED — no merge, no Test/Production deployment**.

## Provenance and coordination

- Start main: `5888176454648f51d5f986be60a22847bd234777` (latest `origin/main` fetched on Debian 13.6 miniPC).
- Independent branch: `auto/hourly-b-season-ledger-sql-hold-v577-20261027-0935`.
- Source of defect: QA v1312, Issue #1507. Prior P0 #1502 is separately held in Draft PR #1504; no duplicate edits to space finance. Other open B/C/A/Planning PRs and QA evidence reviewed before choosing scope.
- Read `AGENTS.md`, `README.md`, English `docs/planning/PROJECT_PLAN.md` and Korean `PROJECT_PLAN.ko.md`; English governs, Korean is supporting. Main's living plans are planning drafts, not approved runtime changes.
- **Migration dependency:** migration 280 already belongs to Draft PR #1481. This branch includes its exact SQL without modifications, followed by newly authored 281. Required by `migration-parity.test.ts` contiguous numbering. Do not merge this branch until #1481 has merged and the duplicate 280 is removed by rebase. This is not a claim of independent 280 ownership.

## Root cause and implementation

Independent read-only DEV query confirmed `moneyverse_app` EXECUTE=true, direct account-balance UPDATE=true, and ledger-postings reference=false. Legacy `season_claim_reward` in applied migration 231 directly updates account balances, conditionally debits SYSTEM, inserts a transaction with `ON CONFLICT DO NOTHING` and no ledger postings, then marks claim paid. This can violate double-entry integrity. Read-only QA found zero `SOURCE_SEASON_REWARD` transactions; no historical loss is established.

- Backend `SeasonController.claimReward`: after session identity resolution, returns HTTP 503 with `SEASON_REWARD_LEDGER_UNAVAILABLE`, without invoking the payout service. Existing authenticated/consent/CSRF guards remain.
- `PostgresSeasonRepository.claimReward`: independently fails closed with the same 503; protects non-HTTP callers and does not execute SQL.
- New migration `281-season-reward-ledger-settlement-hold.sql`: replaces the unsafe function with SQLSTATE 55000, revokes EXECUTE from PUBLIC/app and direct INSERT/UPDATE/DELETE on season claims from app. Read-only SELECT remains. Applied migration 231 and existing balances/postings untouched.
- Next server action: returns an explicit unavailable state without calling `mutate`; banner shows pending reward with a visible hold notice, not a claim button. No invented success or lost WLD claim.
- API path and request schema unchanged; successful claim receipt is intentionally unavailable. No historical data repair, backfill, balance change or new economic feature.

## Test evidence

- TDD RED: Backend 3/4 failed, DB 2/2 failed (missing migration), UI RED attempt was inconclusive under inherited `NODE_ENV=production` (`React.act` unavailable); only GREEN is claimed after correction to `NODE_ENV=test`.
- Focused GREEN: Backend 9/9, DB 2/2, Frontend banner 2/2, crafted server action 1/1.
- Isolated PostgreSQL 17.11 (network disabled, synthetic data only): migration 281 applies and re-applies; privileged invocation SQLSTATE 55000; app EXECUTE and direct DML rejected with 42501; SELECT retained; 100 concurrent attempts all rejected; balance remained 1000 and no postings created. Migration 280+281 stack also applied and validated. No DEV/Production DB mutations.
- Full `pnpm typecheck` PASS. Full `pnpm test` PASS after adding dependency 280; Backend 1,330 PASS / 398 SKIPPED; Frontend 1,423 PASS at first full run; Contract 38 PASS; DB 17 PASS / 3 SKIPPED. Final full rerun includes the new action test: Frontend 1,424 PASS (267 files), Backend 1,330 PASS / 398 SKIPPED, Contract 38 PASS, DB 17 PASS / 3 SKIPPED.
- Default `pnpm build` PASS. `pnpm api:contract:check` PASS (179 endpoints). Repository security/control-byte/Prisma guards PASS; security guard tests 7 PASS. ESLint final rerun exit 0: 0 errors, 1,128 warnings.
- Production-only dependency audit PASS (0 known vulnerabilities). Full pnpm audit FAIL: 24 vulnerabilities (2 critical, 8 high, 11 moderate, 3 low). Bot npm audit FAIL: 6 (1 critical, 5 high). Bot test 8/8 PASS after restoring missing isolated-worktree bot dependencies.
- Official Test public `/api/version` is `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production is `6a989b5ac0c6155587d43426d64f6def6b62c917`. Candidate is not deployed; official Test exact-SHA authenticated finance E2E and GitOps release gate BLOCKED.

## Release and cleanup policy

PR Draft + hold. Do not merge until 280 dependency resolved, all CI/security gates PASS, full migration parity/ACL and authenticated official Test exact-SHA verified. Do not promote Production or run financial writes. Other workers' worktrees and automations untouched; only this run's disposable PostgreSQL container may be removed. Root filesystem ~100% and data volume ~97%; storage risk remains P0 #1170.
