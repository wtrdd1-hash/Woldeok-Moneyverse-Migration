# B v601 — P0 stock halt SQL boundary containment (HOLD)

## Before work
- Baseline: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c` (`origin/main`), issue #1553.
- Read AGENTS.md, README.md, English/Korean project plans, QA v1334, open PRs, CI and B v585 containment.
- Backend halt is already disabled, but legacy `stock_halt_and_settle` and `treasury_fund_stock_halt` remain callable at the database boundary. Legacy funding has no replay receipt and can debit twice.
- The main migration list has duplicate 283; QA #1610 reserves 285, B #1627 reserves 286. This candidate reserves 287 but MUST NOT deploy or merge before coordinated contiguous lineage and checksums are verified.
- Planned: RED source tests; forward-only fail-closed SQL; isolated PostgreSQL function/ACL/rollback tests; complete gates and CI; no production or live development DB mutation.

## In progress
- Pending.

## Finished
- Pending.

### Implementation checkpoint
- RED: four Vitest regressions failed on missing migration (source baseline).
- GREEN: four focused regressions pass after forward-only 287 SQL hold.
- Real isolated PostgreSQL 17.11: legacy grant baseline, SQL replacement and replay-safe failure, app/PUBLIC EXECUTE revocation, receipt DML revocation, reapply, 100 concurrent denied owner calls and unchanged synthetic vault/ledger/receipts all PASS.
- The migration intentionally does NOT revoke shared treasury vault/ledger DML: other backend banking, pension, FX and SWF consumers still directly write them. This separate P0 security debt must not be concealed.
- Work remains HOLD because main has duplicate 283, missing 285/286, existing QA and B PRs are not merged, and no exact-SHA Test validation is available.
