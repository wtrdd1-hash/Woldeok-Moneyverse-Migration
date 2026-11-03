# v2026.11.03.1702 — Canonical finance correction compatibility (worklog)

## BEFORE — 2026-11-03 KST
- User requests restoration of *actual* finance functionality and asks not to spend this cycle debating legacy DB privileges. Do not bypass canonical posting, authorization or reserve checks and do not create unapproved WLD.
- Read AGENTS.md, integrated planning, Treasury Core spec, SQL083 correction contract, isolated PR #2632 SQL329 and actual GitHub CI run 41583159534 (runtime-check **FAILED** after all migrations applied and builds/typechecks passed).
- **Reproduced from CI logs:** `backend/src/ledger-corrections.db.test.ts` fails 2/10 with `this transaction has records that would be left behind: finance_integrity_receipts`. Old SQL083 dynamically enumerates all transaction FK dependents excluding only `ledger_postings`; SQL329 adds immutable canonical proof FK. A true correction must preserve original journal and its proof but may reverse it with a new balanced transaction. A second incompatibility is SQL329 statement-level `ledger_transactions` UPDATE prohibition versus SQL083's one-time `reverses_transaction_id` update.
- Existing PR #2632 and its owner are left unchanged. Dedicated **stacked** branch `fix/finance-integrity-reversal-compat-v1702-20261103` based exactly on #2632 head `df1f2e73fc15f5e5c6833254d4e4cb076bd7e38c`. No deployed DB / WLD mutation at this stage.

## PLAN
1. Add RED DB regression that a normal correction with integrity proof succeeds and replay/second correction retain their original semantics; changing non-link fields, deleting or truncating journal/proof must still fail.
2. Update **unapplied** SQL329 only (never rewrite production-applied SQL083): exempt the trusted internal proof FK from SQL083's generic business-dependent detector, and allow only a narrowly validated first-time correction-link metadata write through the ledger append-only trigger while continuing to forbid all other modifications.
3. Real PostgreSQL test under CI, review migration parity, run focused source/security tests, keep separate PR against #2632 branch.
4. Request final merged-main Test/Production only when parent #2632 and full CI are both green. No false operational completion claims.

## DURING
- GitHub source analysis confirms SQL083 `economy_transaction_dependents` discovers any FK to `ledger_transactions`; new SQL329 proof FK was treated as a loan/purchase-like business dependency. Generic correction failed on finance_integrity_receipts even though that proof is deliberately immutable and not an external claim.
- A second incompatibility exists: SQL083 creates a new compensating transaction, then sets `reverses_transaction_id` once. SQL329's statement-level blanket ledger UPDATE trigger rejects that single link. No previous applied migration has been changed.
- Edited only un-applied SQL329 on isolated stacked branch: replace blanket ledger tx UPDATE/DELETE trigger with guarded row-level correction-link exception. It requires exactly first-time link, ADMIN_ADJUSTMENT, matching persisted reversal outbox, unchanged other columns and superadmin; DELETE and TRUNCATE remain rejected. Ledger postings and finance JSON receipts remain immutable.
- SQL329 redefines only `economy_transaction_dependents` to exclude the canonical `finance_integrity_receipts` row exactly as `ledger_postings` are excluded, while still refusing all genuine business FK dependents (loans, shop, etc.).
- Extended existing real-PostgreSQL ledger correction test: asserts both original and correction have immutable proof records and a type rewrite still fails with SQLSTATE 55000. Existing 2 failing correction tests from CI are RED evidence.
- Awaiting stacked-PR CI; Production and Test releases are not changed.

## FINISHED
Pending CI, independent review, and exact-main release gates.
