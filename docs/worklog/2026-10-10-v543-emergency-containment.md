# v2026.10.10.543 Emergency Economy Containment and Release Provenance — Worklog

> Status: IN PROGRESS
> Branch: `fix/v543-emergency-containment-20261010`
> Start origin/main: `545e8231f8b90b543ed9de0722adf98d63587820`
> Approved scope: P0 emergency containment from the v542 planning/code audit.
> Runtime claim at start: none. No Test or Production success is claimed until exact-SHA evidence exists.

## Pre-work record

- Re-read the current documentation governance, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, Central Bank/Mint/Treasury/Economy Core authority, sovereign macro specification, FX/NPS specifications, and Production deployment contract before editing.
- Rechecked GitHub `main` on 2026-10-10 and found it 106 commits ahead of the v542 audit baseline.
- Confirmed that current `main` still schedules AutoSovereignWealthFundService 30 seconds after backend startup and hourly thereafter.
- Confirmed the current SWF implementation still contains source-free treasury credit, synthetic portfolio growth/harvest, direct bond/pension balance credits and swallowed DB errors.
- Confirmed migration 253 still grants `ALL PRIVILEGES` on `treasury_bond_repo_loans` to `moneyverse_app`.
- Confirmed FX forward/swap paths still use non-canonical `accounts.user_id` / `account_balances.available_balance` SQL in the current source.
- Debian 13 Desktop Commander is connected but execution is currently unavailable because the connector monthly usage limit is exhausted. Per project policy, work has switched to GitHub rather than retrying/reconnecting.

## Planned v543 change boundary

1. Make autonomous SWF execution fail closed at runtime unless explicitly enabled.
2. Remove restart-triggered economic mutation; scheduler must not execute a cycle on process boot.
3. Add transaction-scoped advisory locking and minimum-interval enforcement for any explicitly enabled SWF cycle.
4. Add regression tests for the fail-closed gate, scheduler behavior and lock/interval gate.
5. Add a tracked immutable host-release staging/promotion contract that refuses in-place mutable Git releases and binds releases to an exact SHA.
6. Update English canonical + Korean second-language documentation, internal update log and GitHub-facing update note.
7. Recheck `main` midway and before integration.
8. Require GitHub CI and exact-SHA isolated Test evidence before any Production promotion.

## Explicitly deferred to v544

The unsafe economic formulas and direct-table settlement paths will remain unreachable by default after v543, but their structural replacement with SECURITY DEFINER / Economy Core settlement functions, conservation-correct pension/bond/repo/FX flows and forward migration privilege repair belongs to v544.


## Mid-work checkpoint

- Mid-work `main` recheck detected `origin/main=9e17095586c46e43ec1a68214658e512e457148a`, one commit ahead of the start SHA.
- The concurrent commit did not touch SWF, treasury, release, deployment or authority-document paths. The v543 branch was nevertheless rebuilt on that exact latest `main` before continuing.
- Implemented SWF runtime containment:
  - `MONEYVERSE_SWF_EXECUTION_ENABLED` is fail-closed unless exactly `true`.
  - `MONEYVERSE_SWF_SCHEDULER_ENABLED` is separately fail-closed.
  - backend startup no longer triggers a 30-second economic mutation.
  - explicitly enabled scheduled execution starts only after a full one-hour interval.
  - every execution attempts a transaction-scoped PostgreSQL advisory lock.
  - `treasury_swf_configs.last_executed_at` and `rebalance_interval_hours` enforce a durable minimum interval.
- Added regression coverage for default-disabled execution, restart behavior, overlapping-cycle rejection and minimum-interval rejection.
- Added `ops/release/stage-host-release.sh`: it accepts only a clean worktree at the approved 40-character SHA, requires built backend/frontend artifacts, creates a unique never-overwritten release directory, strips Git metadata and writes `.moneyverse-release.json`.
- Added release-layout tests that prove exact-SHA staging and overwrite/mismatched-SHA rejection.
- No Test or Production deployment has been claimed. GitHub CI and exact-SHA isolated Test remain mandatory.
