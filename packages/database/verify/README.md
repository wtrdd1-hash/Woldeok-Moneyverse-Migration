# Schema fingerprint

`schema-fingerprint.sql` prints one line per table (with every column, its
type and nullability), per function (with its identity arguments and whether
it is `SECURITY DEFINER`), per enum type, and per table grant held by
`moneyverse_app` or `moneyverse_executor`.

Two databases that print the same set of lines have the same schema in every
respect this application depends on.

## Proving a port

Build a database from `../init` plus `../migrations`, then diff its
fingerprint against the reference database:

```bash
psql -qAt -f schema-fingerprint.sql > built.txt      # against the new database
psql -qAt -f schema-fingerprint.sql > reference.txt  # against production
diff <(sort built.txt) <(sort reference.txt) && echo 'schemas identical'
```

Run on 2026-08-27 against `woldeok-moneyverse-production-db-1`: 200 lines
each, zero differences. That is what establishes this repository can rebuild
production's schema from scratch — a checksum manifest only proves the files
are the ones that were applied, not that applying them lands in the same
place.

## Persistent data integrity gate

`data-integrity.sh` runs `data-integrity.sql` with `ON_ERROR_STOP=1` and fails
closed if durable economy state violates an invariant. It is intentionally
read-only and safe to run against test or production with a role that can read
the catalog and economy tables.

It verifies:

- every account has its matching `account_balances` row;
- every ledger transaction has at least two postings and balanced debit/credit totals;
- every stored account balance equals the amount reconstructed from the ledger;
- accounts that disallow negative balances are non-negative;
- public constraints are validated and indexes are valid; and
- `moneyverse_app` has not regained direct write privileges on protected economy tables.

CI runs this immediately after rebuilding the database from init + migrations.
Operations should run the same gate on the test database before production
promotion.
