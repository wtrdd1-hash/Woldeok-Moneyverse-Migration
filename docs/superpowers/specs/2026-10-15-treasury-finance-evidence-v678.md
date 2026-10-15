# Treasury Accounting Evidence & Safe Read Model (v2026.10.15.678)

**Status:** Implementation tranche / not an authorization to pay. [한국어](2026-10-15-treasury-finance-evidence-v678.ko.md)

## User intent and sources
The user requested a more detailed Treasury-wide plan and development. This patch is a **bounded P0 truth-and-safety correction** for the already implemented Treasury reconciliation and admin read model, not a redesign of money movement. Project authority: PROJECT_PLAN → INTEGRATED_PLANNING_MASTER → adopted central-bank/mint/treasury/Economy Core v523 and v542; see read-only v676 full audit (PR #859) and independent grant proposal (PR #857). Starting main: a24a8ae9e0d14dbd63738f5bb7e4e857ca412c13.

## Alternatives
- Continue hardcoded `RECONCILED/0`: rejected as objectively false.
- Assert `VAULT_MAIN` must equal the Economy Core treasury account and auto-copy to reconcile: rejected as different accounting domains and potential unauthorized minting.
- **Selected:** compute real fiscal vault-vs-fiscal-journal movement and chain continuity from read-only data, introduce explicit `UNVERIFIED` until an independently audited Economy Core funding bridge exists, show `DISCREPANCY` for observed within-subledger defects, and disable **read-model** estimates of spendable funds while unresolved.

## Contracts
- Replace both `TreasuryRepository.getReconciliation()` and `getOverview().reconciliation` hardcoded results with one SQL query that reads all five vault balances and independently aggregates fiscal journal per-vault signed `balance_after - balance_before`. Compare **per vault absolute difference** (cannot net mismatches in opposite vaults).
- Count per-vault sequence discontinuities: order by `created_at, id`; `balance_before` must equal preceding `balance_after`. Match each journal `abs(after-before)` to `amount_wld` except supported accounting-neutral audit events explicitly classified in an auditable policy; absent such policy, flag inconsistency instead of assuming a transfer.
- `DISCREPANCY` when real fiscal balance deltas do not match vault, or chain continuity/movement has issues; `UNVERIFIED` when fiscal internals look consistent but there is no linked, conserved Economy Core transaction and valuation/revenue provenance. `RECONCILED` is reserved for future independently validated canonical cross-ledger evidence, which this tranche **cannot** produce.
- Expose `journal_integrity_issues` count and a user-readable warning; add `UNVERIFIED` to backend/frontend types. Numeric amounts are decimal integer **strings**, computed with PG NUMERIC, never JS Number.
- `getOverview().available_wld='0'` and `coverage_days=0` unless evidence reaches `RECONCILED`. These are non-authoritative overview **indicators**, not an enforcement of SQL payouts; do not falsely claim financial commands are disabled.
- Never mutate balances, vaults, ledger entries, grant approvals, configuration or Production on this tranche.

## Full remediation roadmap
G0 emergency: preserve Production snapshot and implement controlled SWF runtime freeze; deployed prod-v600 still starts timer without the main's env gates. Do not override a live DB switch without safe rollback authorization.
G1 **this tranche**: truthful read-only reconciliation and UI states with unit/contract tests and read-only live SQL evidence.
G2 restore/verify Development/Test account-vault provenance, double-entry payment primitives, privileged functions and forward-only migration ACL. Block legacy unaudited disbursement RPC.
G3 public Treasury transparent reporting API (no admin-only fallback), DAO one-user-one-vote DB and idempotent citizen benefit/grant application + reviewer identities. Remove example payout cards.
G4 verified balances, reserved liabilities, grant/disbursement receipts, NPS/treasury-bond and investment flows, central bank/mint governance.
G5 exact-SHA CI → isolated Test frontend/backend/DB/security and invariant tests → reversible zero-downtime Production promotion with backups/session/rollback verification.

## Acceptance
- TDD red/green for normal fiscal match (`UNVERIFIED`), mismatched vault (`DISCREPANCY`), broken chain (`DISCREPANCY`), inflow and outflow signed changes, missing journal and precision > Number.MAX_SAFE_INTEGER, no mutation SQL.
- TS backend typecheck/build, targeted Vitest and existing service tests; render 3 statuses with explicit Korean labels and non-green discrepancy numbers.
- Production/Test remains unchanged unless all release gates independently pass.

## References and design implications
- IMF, [Treasury Single Account](https://www.imf.org/en/publications/wp/issues/2016/12/31/treasury-single-account-concept-design-and-implementation-issues-23927): consolidation of cash management is distinct from monetary creation; unify Treasury accounting and budget earmarks without inventing issuance.
- PostgreSQL 17, [data consistency checks](https://www.postgresql.org/docs/17/applevel-consistency.html): read-only evidence snapshots are not adequate to authorize concurrent withdrawals; the future payment path needs locking and isolation acceptance tests.
- PostgreSQL, [privileges](https://www.postgresql.org/docs/18/ddl-priv.html): explicitly REVOKE default PUBLIC function execution and grant narrowly after restored Test privilege review; do not apply blanket changes to Production.
