# Shop Envelope Test Transaction Repair — v2026.09.20.302

Date: 2026-09-20
Branch: `auto/hourly-b-shop-test-tx-v2026.09.20.302`
Status: implementation / CI revalidation

## Scope

PR #590 real PostgreSQL CI passed migration 218 and 1,471 tests, then exposed one test-harness defect: the intentional conflicting idempotency replay raises SQLSTATE `22023`, which aborts the surrounding PostgreSQL transaction before the balance invariant can be queried.

The regression test now wraps only the expected failing statement in a savepoint, verifies `22023`, rolls back to that savepoint, and then verifies the authoritative cash balance remains `840`. Production SQL and ledger behavior are unchanged.

## Verification

- Fresh PostgreSQL 17 migration chain through migration 218: passed.
- Targeted real-DB shop catalogue + privilege-boundary tests: 20/20 passed.
- `git diff --check`: passed.

## Promotion gate

No main or Production promotion until GitHub CI and the exact-SHA isolated Test candidate are green.
