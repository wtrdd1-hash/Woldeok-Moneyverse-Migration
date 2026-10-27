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
