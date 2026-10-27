# B v589 — Strict admin pension payout history pagination

## Before work
- [x] Connected to miniPC Debian 13.6, read AGENTS.md, README and EN/KO plans, QA v1322, main, PRs and CI.
- [x] Starting main: 59cdc2e02f0e83e5401049309c4cb89ff57c2d4c; independent worktree/branch: auto/hourly-b-pension-payout-paging-v589-20261027-1935.
- [x] Selected P1: \ silently coerces 0 and accepts unbounded/noninteger values. Scope is only read query integrity.
- [x] RED regression tests (21 FAIL / 8 PASS before fix); [x] minimal safe implementation; [x] PostgreSQL evidence; [ ] final gates; [ ] CI; [ ] Test exact SHA.

## In progress
- RED 21/29 failed before fix. GREEN 29/29 and HTTP 2/2 passed; Typecheck passed. Invalid/duplicate/noncanonical/out-of-range limits now return 400 before service/SQL. Direct repository calls enforce 1–100.
- Isolated PostgreSQL 17.11 synthetic table: prepared parameter limit returned 1/2 rows; readonly role UPDATE denied, unchanged data. Container removed. No production or dev DB mutations.
- Pending full gates, CI and exact-SHA Test; retain Draft/HOLD.

## Finished
- Pending evidence.
