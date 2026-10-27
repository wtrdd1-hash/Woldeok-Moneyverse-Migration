# B v589 — Strict admin pension payout history pagination

## Before work
- [x] Connected to miniPC Debian 13.6, read AGENTS.md, README and EN/KO plans, QA v1322, main, PRs and CI.
- [x] Starting main: 59cdc2e02f0e83e5401049309c4cb89ff57c2d4c; independent worktree/branch: auto/hourly-b-pension-payout-paging-v589-20261027-1935.
- [x] Selected P1: \ silently coerces 0 and accepts unbounded/noninteger values. Scope is only read query integrity.
- [ ] RED regression tests; [ ] minimal safe implementation; [ ] PostgreSQL evidence; [ ] final gates; [ ] CI; [ ] Test exact SHA.

## In progress
- Awaiting RED reproduction. Avoid changing pension payouts, money, SQL migrations, other workers' files.

## Finished
- Pending evidence.
