# v2026.10.29.1501 — Central-bank admin truth and sovereign-fund mutation containment

## BEFORE — 2026-10-29 13:55 KST
- User screenshots show central-bank mint acceptance claimed without durable confirmation, SWF liquidation HTTP 500, and a misleading rebalance "waiting" notification.
- Read canonical DOCS_INDEX, integrated planning master, AGENTS, SWF specification, central bank/mint/treasury architecture, release policy and source code.
- Production v1213 backend journal at 13:51 / 13:53 KST records SQLSTATE 42P08 (parameter 1: text vs numeric) inside liquidateToTreasuryVault; the same method directly edits treasury balances and synthetic portfolio values without an Economy Core double-entry settlement receipt. Fixing only the SQL cast would permit unbalanced balance creation; do not execute it against Production.
- CentralBankPanel hardcodes monetary aggregates, a fictitious MINT-202610-002 request and policy values. All three button actions change browser state only. The current Nest Mint/CentralBank services also hold batch/policy values in process memory without durable ledger settlement. The autonomous SWF rebalance endpoint intentionally returns HTTP 503 with SWF_LEDGER_SETTLEMENT_UNAVAILABLE.
- Isolated branch fix/central-bank-swf-controls-v1501-20261029 from main b84d645a8, without modifying the dirty shared checkout or other workers' branches. No live DB write has been performed.

## Planned changes / gate
- [ ] RED regression for manual liquidation, Next gateway and operator status.
- [ ] Prevent unreceipted SWF cash movement and return an explicit unavailable reason instead of 42P08/500.
- [ ] Replace fabricated central-bank UI state with verifiable read-only server state; clearly distinguish in-memory policy and mint demo data from canonical ledger.
- [ ] GREEN tests, typecheck, builds, current-main rebase and release verification.
- [ ] English/Korean internal and GitHub updates, CI/Test/Production evidence.
- Do not claim a cash transfer, settled mint, or autonomous growth without separately certified ledger migration and E2E acceptance.

## IN PROGRESS
- Reproducing source/runtime boundary and preparing regression tests.

## FINISHED
- Pending validation and release decision.
