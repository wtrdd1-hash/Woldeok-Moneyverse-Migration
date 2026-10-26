# Backend B v557 — Club charter ledger/idempotency P0

## Before work (2026-10-26 15:35 KST)
- Base main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- Branch: `auto/hourly-b-club-charter-ledger-v557-20261026-1535`.
- P0 source: #1396; migration 222 directly updates balances before an ignored ledger transaction conflict and writes no postings.
- Read AGENTS, README, English/Korean living plans, open PRs #1417/#1418/#1419/#1420, QA #1412, latest CI, and other developer work. Do not edit other worktrees.
- Plan: add forward-only migration 280 with key-serialized, actor/payload-bound immutable receipt; use canonical balanced ledger primitive for charter fee; test replay, changed payload, insufficient balance, concurrency, and app privileges against disposable PostgreSQL. Fail closed on unrelated unsafe project contribution until ledger settlement is implemented. No shared DB writes.
- Release gates: main merge and Test/Production prohibited unless full tests, audits, isolated exact-SHA Test and GitOps pass.

## In progress
- [ ] RED regression evidence.
- [ ] Migration and regression tests.
- [ ] Local verification and PR review.

## Finished
- Pending.

### In progress checkpoint (2026-10-26 15:39 KST)
- RED: absent migration failed new Vitest regression suite; GREEN: 3 static ledger/replay/ACL tests passed.
- New forward-only migration 280 adds actor/payload-bound immutable receipt, key advisory lock before replay, balanced canonical ledger posting and transactional club creation. Legacy unposted keys refuse reuse. Unposted club project contributions fail closed (no false successful funding).
- Isolated PostgreSQL 17.11: all 279 SQL migrations (002..280) applied; 236 public tables. Synthetic app-role replay/role/rollback fixture passed after correcting its expected SQLSTATE and legacy hash. 100 concurrent requests using pgbench (20 clients, 5 calls each) all passed, exactly 1 club, 1 ledger transaction, 2 postings and 10,000 WLD debited once. Re-testing final bytes after additional sink/rollback assertions pending.
- Main mid-run fetch unchanged. No shared DB writes, no other worktree modifications.
