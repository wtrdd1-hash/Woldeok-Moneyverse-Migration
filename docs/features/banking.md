# Banking, Credit & Virtual Bonds

The banking subsystem manages virtual deposits, deposit interest, credit-grade loans and virtual bonds. Everything is denominated in in-service WLD.

## Deposit interest

Displayed and settled interest must come from the same server-side rate contract.

### Integrity rules

- deposit/withdrawal balance changes reset the accrual clock;
- interest below 1 WLD is accumulated rather than rounded up into a free minimum payout;
- one idempotency key represents one manual interest claim;
- replaying the same key returns the prior settlement rather than paying again;
- application code cannot directly manipulate the internal deposit-interest tracker table.

These rules prevent two historic failure modes: retroactively applying elapsed time to newly deposited money, and repeatedly claiming a forced minimum 1 WLD.

## Loans

New loans use the existing credit-grade policy rather than an alternate bypass path.

The policy can define, per grade:

- borrowing ceiling;
- total interest rate;
- maturity duration;
- repayment rules.

Existing loans retain the contract under which they were issued. A software release does not silently rewrite historical debt terms.

## Virtual bonds

Bond purchases/maturity are virtual economy contracts. Displayed expected settlement should use exact integer arithmetic and must match the database contract.

Existing bonds are likewise not retroactively rewritten by a later policy release.

## Money representation

All balance, loan, bond and interest amounts must remain canonical integer strings across the API. Use `BigInt` only for exact arithmetic in code paths that need it.

## Private current cash/deposit snapshot (candidate only)

A signed-in member can request `/bank/standing.csv`, which obtains `GET /api/v1/banking/standing/snapshot` from the owner-scoped PostgreSQL `bank_get_my_standing` read function. Android uses `GET /app-api/v1/banking/standing/snapshot` with the same session/consent policy. The response is private and non-cacheable. Cash, deposits and **estimated, unclaimed** interest remain exact integer strings; the export excludes loans, bonds, transaction history and third-party data. It is not a bank certificate, paid-interest receipt, ledger settlement or full net-worth statement. Failed authentication/DB/validation produces no CSV. This is an unmerged feature candidate; release remains on hold.

## Related surfaces

- `/bank`
- `/wallet`
- admin economy/control read models
