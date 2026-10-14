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
