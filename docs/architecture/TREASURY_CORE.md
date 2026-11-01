# Treasury Core — one canonical financial settlement boundary (v2026.11.01.1618.2)

## Purpose and scope
The Treasury Core is **not** the UI, and a Treasury configuration value is **not** spendable WLD. The core is the only approved entrypoint for *new funded pension transfers*: `public.treasury_core_post(actor, idempotency_key, command, exact_wld)`. All money must move via the existing canonical `economy_post_transaction` primitive, which writes an idempotent transaction, balanced postings, account balances and an outbox event in one transaction. Core also writes its own immutable evidence receipt and funded pension liability in that transaction.

## Money model
- `USER_CASH`: authenticated member's actual spendable account, must be active.
- `ESCROW:national_pension_fund`: dedicated funded pension asset, starts at zero and never permits negative balances.
- `ESCROW:national_pension_welfare`: separately earmarked **actual** 5% early withdrawal fee; not a fictional Treasury vault or supply burn.
- `TREASURY:treasury`: independent canonical current fiscal vault 0 WLD; historic 552 Treasury and 744 SOE dividend entries are not automatically certified.
- `MINT`: supply authority, *not authorized by NPS core*. No arbitrary Treasury mint or Central Bank printing is approved.
- **Global WLD supply conservation:** every allowed transfer is double-entry; `NPS_FUND` moves user→fund, `NPS_WITHDRAW` moves fund→95% user+5% welfare escrow, with exact integer WLD. Nothing is minted.

## Authorization and proof
- Application identity comes from protected Nest `requireUserId(req)` and authenticated session + consent + one-use CSRF; neither web browser nor client may choose actor identity.
- DB function is SECURITY DEFINER under `moneyverse_migrator`, with fixed `pg_catalog,pg_temp` search_path and fully qualified tables; `moneyverse_app` receives only EXECUTE and no DML on protected fund position/receipt tables.
- Every command is serialized per actor; UUID idempotency key is mandatory, repeated identical request returns same ledger receipt, changed parameters fail. Account ownership, status, unique cash/fund accounts, current monetary policy, 1000 WLD minimum funding, sufficient cash/escrow funds are enforced at the DB layer.
- `treasury_core_receipts` and `pension_funded_receipts` link the exact canonical ledger transaction to amounts and operation. Core receipt UPDATE/DELETE/TRUNCATE rejects ordinary SQL mutation. Missing or malformed receipt causes the Nest API and Next BFF to fail closed.
- The funded position is separate from historic `national_pension_accounts` and pension payout logs. No old balance is silently written into the new escrow, and no historic 238 unjournaled payments are replayed.

## Current integration / not yet authorized
| Domain | v1618 core status |
|---|---|
| Treasury current fiscal proof | Existing scoped canonical reconciliation, verified zero; separate from core assets |
| National Pension new funding | `NPS_FUND` implemented in SQL + Nest + BFF/UI, release pending |
| National Pension new funded withdrawal | `NPS_WITHDRAW` 95% member /5% welfare, release pending |
| Pension historical pensions and hourly payout | **BLOCKED**, lacks funded canonical liability proof |
| SOE dividends, bond disbursements, SWF | **BLOCKED** without independently certified source and funds |
| Mint issuance, Central Bank money supply | **BLOCKED** without separate authorization, signed supply evidence and dual approval |

## Release acceptance
Maintain immutable original Production migration314/backup checksum, protect all member balances; independently test private restored PostgreSQL transaction, actor spoof rejection, altered idempotency key, two concurrent requests, rollbacks, insufficiency, >MAX_SAFE_INTEGER, receipt tamper, global money conservation, actual admin/user session/CSRF, Test exact SHA and no-downtime Production release with rollback. **Migration SQL application success or mocked unit tests alone is NOT financial settlement certification.**
