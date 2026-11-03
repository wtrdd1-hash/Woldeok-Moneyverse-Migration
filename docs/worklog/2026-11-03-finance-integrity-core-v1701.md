# Financial integrity core — v2026.11.03.1701 worklog

## BEFORE
Operator requested upper shared financial core, Treasury/member/bank/market stages, JSON/DB proof and internal-only core access. Inspected AGENTS, DOCS_INDEX, English/Korean living plans, Treasury Core and SQL 005/194/195/269/294/322/325/328. Initial main was 45599a6a49, then ea8a238d19 and 8c5caae4e2. Another developer had uncommitted security changes in the main worktree; created isolated fix/finance-unified-integrity-core-v1701-20261103 worktree.

## DURING
SQL329 introduced atomic per-transaction JSON receipts, exact posting and balance-change checks, immutable journal/receipt triggers, replay validation, internal aggregate scan and strict web-role permission revocations. No public HTTP API, real user transfer or Production DB change.

## VERIFIED
Isolated PostgreSQL 17.11 migration applied successfully using an explicitly synthetic schema fixture. Five financial transactions across 4 domain classifications, large exact WLD, same-key replay, changed-payload rejection, zero-sum/overdraft failure and rollback, immutable journal/JSON, synthetic drift ALERT, web-principal ACL denials and reconciler CLEAN all passed (SQL exit 0).

## LIMITS
Real Production-schema migration, backend staging, independent database restore, complete CI and zero-downtime release have not been certified. Existing direct balance write paths and secondary Treasury/stock/loan projections require separate integration. Do not claim historical mismatches resolved.

Additional disposable SQL fault injection forced proof receipt insertion failure after the journal/outbox write point; verified the entire SQL statement reversed postings, balances and outbox together (exit 0). Source-only dev compose loopback binding passes Docker Compose config; live host 5433 still bound to 0.0.0.0 until controlled rollout. Focused Vitest migration parity and source/security assertions 12/12 PASS.

## v1701.1 — CI failure and correction
Full GitHub CI attempt 41583202379: 3,607 backend tests PASS, two correction tests FAIL. Root cause: SQL083 generic transaction-dependent FK walker saw new finance_integrity_receipts as an actionable business record; the strict UPDATE trigger also needed an exception for one-time reversal metadata. Reworked unapplied SQL329 to ignore *only* the new accounting-proof FK while preserving all other FK holds, and allow one non-monetary correction link contingent on exact immutable originating reversal outbox evidence. Isolated full Production schema/database backup clone applied revised SQL329; synthetic correction POST+reverse+tamper rejection PASS within a ROLLBACK. Post-test original clone still 891 transactions, 1,829 postings, zero receipts and CLEAN. Re-run CI and exact-SHA official Test/Production required; earlier CI is a failure and must not be called a pass.
