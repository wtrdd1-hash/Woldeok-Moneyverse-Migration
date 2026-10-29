# v2026.10.29.1205 — Ledger discrepancy resolution architecture (isolated Test implementation)

**State: TEST_VERIFIED for registry / NOT RESOLVED historical balances / NOT Production.** Start main `bd590720237020c2ad329d6f62c3b0db5a95a6c1`; concurrent-agent worktrees left untouched. Existing financial DML grants preserved per user directive.

## Critical correction to previous diagnosis
Previous v1202/v1203 assistant scans used the WRONG sign: credit-positive. The canonical `economy_post_transaction` implementation and official reconciliation migration 018 use `debit` as **positive** account balance change and `credit` as **negative**. On the same isolated restored database the correct polarity yields **18 USER_CASH accounts, each +1,000 WLD stored-minus-journal, total 18,000 WLD**. MINT/SINK/USER_BANK/TREASURY all match. Zero transaction-wise imbalance. Earlier reports of 24 accounts / 20,261,240 WLD are withdrawn as incorrect polarity calculations and retained only as historical error evidence, not as current financial findings.

The 18 cases are evidence of unjournaled opening allocation or other legacy balance mutation, but provenance is NOT established; do not assume free money or alter balances based on this alone. All 552 treasury-side records have NULL canonical ledger ID in the snapshot; those are separately classified by creation era and cannot be assumed corrupt or backfilled blindly.

## Implemented mitigation
Forward-only migration `294-ledger-discrepancy-case-registry.sql` creates `ledger_reconciliation_runs` and `ledger_reconciliation_cases` with PK/FK/CHECK constraints, immutable observed fields and strict signed-delta consistency. `ledger_capture_reconciliation(source_tag)` captures aggregate per-account evidence and rejects scan-count races; it records journal imbalance count and uses correct debit-positive convention. Execute in `BEGIN ISOLATION LEVEL REPEATABLE READ` for writer-enabled systems. It performs NO account, posting, treasury or balance updates and no automatic compensating issuance. Explicit execute grant goes to the existing `moneyverse_reconciler` role, while app's existing approved finance grants remain unchanged. The evidence registry itself denies direct app writes.

Verification `verify/294-ledger-discrepancy-registry.sql` executed on isolated restored PostgreSQL 17.11 after migration application and PASS: exactly 18 cash cases of 1,000 WLD, absolute difference 18,000 WLD, zero unbalanced transactions. Test capture executes inside transaction followed by `ROLLBACK` to avoid polluting even isolated evidence. No source or Production data changed.

## Recovery decision matrix
- **Opening grant authorized and legitimately paid:** issue a specifically reviewed, idempotent *canonical balanced opening-recognition* transaction only after documented historical authorization, mint contra account, original timestamps/receipts, and policy cap are proven. This records existing allocation without changing user balance; **must be separately engineered/tested** to avoid double payment and cannot be inferred merely from +1,000.
- **Unapproved balance-side alteration:** only after per-account evidence and case-level human authorization, propose audited correction with both ledger and balance semantics reviewed; never silently reset the cached balance to journal.
- **Mixed or uncertain provenance:** retain `UNEXPLAINED` case, do not post/mint/burn/erase. Alert and compare subsequent snapshots.

## Remaining release gates
Per-user source issuance provenance, bank/treasury/mint link classification, memory/Redis writers, idempotent concurrent replay, case authorization, authenticated official Test E2E, full migration parity, Production DB binding and final sync remain outstanding. No claim of definitive discrepancy remediation or complete finance integrity.

## 2026-10-29 operator-supplied historical funding attribution — Treasury
The project operator explicitly states that the **18 USER_CASH differences of +1,000 WLD per account (18,000 WLD aggregate)** originated from **Treasury-funded payments**. Record the historical business classification as **`TREASURY_FUNDED_PAYMENT`**, provenance **`OPERATOR_ATTESTED`**, and ledger-link status **`NOT_YET_CORROBORATED`**. This supersedes the earlier open question of who funded the payments, but is not a database-verifiable transaction receipt or a match to any particular `system_treasury_ledger` row.

Accounting treatment: **historical Treasury-funded payments, already reflected in recipient balances**, not an instruction to pay 1,000 WLD again or mint/burn/offset any funds. Preserve all actual balances and original journal. Before any correcting journal entries, reconcile Treasury's available balance, historical payment receipt/date, Treasury vault record and intended account debit/credit direction; a backfill must not double-charge Treasury or double-credit recipients. If an existing Treasury-side expense already accounts for the funding, any eventual reconciliation must respect that existing expense. Do not create fabricated historical timestamps or claim the missing canonical transaction IDs have been found.

Evidence classification: operator confirmation = received; independent ledger/receipt verification = pending; balance mutation = none; historical journal correction = none. The isolated clone from the earlier session was not available at the time of this addendum, so no new DB execution or claim of validation is made.
