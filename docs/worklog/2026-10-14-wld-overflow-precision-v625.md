# WLD amount overflow / precision hardening — v2026.10.14.625

## Start — 2026-10-14 KST
- User authorized correcting amount overflow and unsafe precision handling.
- Isolated worktree: `.worktrees/wld-overflow-v625`, branch `fix/wld-overflow-precision-v2026.10.14.625`.
- Starting baseline `origin/main=77e27063059555c97249a63bcd58a3451671150d`; retain all concurrent work intact.
- Reviewed: AGENTS.md, DOCS_INDEX.md, INTEGRATED_PLANNING_MASTER.md, PROJECT_PLAN.md, DATABASE_ARCHITECTURE_SPEC.md, database-security.md, database-migrations.md, RELEASING.md and engineering skills. Adopted planning baseline v530 remains authoritative.
- Read-only DEV evidence: `account_balances.available_amount` and `ledger_postings.amount` use unconstrained numeric; 80-digit numeric round-trip exact. Several adjacent money fields still use bigint; UI fiat Number() and wallet notification Number() can silently lose precision. No live financial data was changed.
- Scope: test-first changes for exact money conversion and notification formatting; investigate and cover selected financial UI simulation overflows; track unconverted legacy surfaces as explicit residuals. No migration edits, no live balance updates, no production deployment without independent gates.

## Mid-work
Pending.

## Final verification
Pending.

### Mid-work checkpoint — 2026-10-14 KST
- `origin/main` re-fetched after writing RED tests; main is still `77e27063059555c97249a63bcd58a3451671150d` (no new concurrent baseline commit).
- Confirmed RED: frontend fiat KRW rounds 80-digit all-nines to a power of ten; wallet notifications turn a 36-digit transfer into a rounded value. Currency test 2 failures, wallet notification 1 failure. Backend initial test command required building local `@moneyverse/contract` (tooling), then reached the expected assertion failure.
- Confirmed GREEN: `currency.test.ts` 7/7, wallet notification precision test 1/1. Implemented exact BigInt minor-unit currency conversion for display and exact BigInt notification formatting; legacy `convertWldToFiat` now rejects unsafe doubles as NaN and `formatFiat` refuses nonfinite values.
- Remaining: wallet full read-path and extra test, typecheck/build/suites, partial-risk inventory and EN/KO report, Test deployment gate review.

### Mid-work checkpoint 2 — 2026-10-14 KST
- Found pension contribution, refund, payout, client account summary, and forecast using unsafe `Number`. Added RED tests for 90/100-digit principal/refund/rate calculations and rejecting unsafe JSON numeric amounts; GREEN after BigInt-based repository/service and frontend read-model changes.
- Checked current `origin/main` again: advanced to `d4f9cc1978bea6ee1a0e904005fa418cd159b4cd` (v222 enterprise documentation consolidation), no collision with financial files. Reconcile without overwriting this concurrent work.
- Both `pnpm --dir backend build` and `pnpm --dir frontend build` PASSED after pension changes. Both frontend/backend typechecks PASSED. Backend full suite before pension change: 1,166 passed / 391 skipped. Database package: 7 passed.
- Frontend full suite BEFORE pension change: 793 passed / 379 failed, largely UI/SEO/React tests outside modified paths. Clean upstream baseline reproduced 3 failures (color contrast and API allowlist, 16 passed), so at least those blockers pre-date v625; no claim that every one of 379 is preexisting.
- Remaining: exact-SHA final tests, documented residual monetary routes, Test approval gates, bilingual change logs and PR.

### Final local verification — 2026-10-14 KST
- Code commit e0b5689f2105642b375a9f16001b0a603f031da5; reconciled concurrent v222 main at merge 8c181a0fd11759d4901c4e369201ae054fb468df. Re-fetched main again and found same d4f9cc1978bea6ee1a0e904005fa418cd159b4cd. No overlap in monetary files.
- Focused frontend: 20/20 (currency 7, money 11, pension 2), backend precision + existing pension: 12/12.
- Final full backend: 1,169 PASSED / 391 SKIPPED (193 files; 140 passed / 53 skipped). Database package: 7/7 passed.
- Final full frontend: 795 PASSED / 379 FAILED (214 files). Compared pre-pension failed test NAME SET with final: 379 vs 379, only-before=0, only-after=0. This demonstrates no additional failing test names within the run, but the overall frontend gate remains FAIL. On clean upstream main, 3 of these fail independently (color contrast and app gateway), 16 tests pass.
- Post-change frontend/backend TypeScript typechecks PASSED, full production builds PASSED; earlier workspace lint had zero errors/1057 warnings; final targeted changed-source lint zero errors/24 warnings. Existing warnings are not removed here.
- Read-only DEV PostgreSQL 80-digit numeric check passed. No full fresh-schema replay, isolated signed-in Test flow, bank/ledger multi-session integration, backup+restore, zero-downtime deployment, or CI acceptance proof.
- Open risks: WLD-625-01 P0 pension/direct balance and treasury conservation; WLD-625-02..04 P1 other Number/bigint/fixed numeric; WLD-625-05 release gates. No Production/Test changes.

### Final git / release status
- Isolated candidate branch; documentation and versioned internal + GitHub changelogs published with a draft PR, not merged to main.
- Production pointer: prod-v600; Test pointer: test-v618-7fa3f245bbc3 observed read-only. Never switched.
- Exact final branch SHA, CI, and draft PR number: see GitHub branch/PR record.
