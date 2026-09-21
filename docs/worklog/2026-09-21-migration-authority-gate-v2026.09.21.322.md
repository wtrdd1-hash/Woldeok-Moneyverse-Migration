# Migration authority gate — v2026.09.21.322

- Branch: `auto/hourly-b-migration-authority-v2026.09.21.322`
- Base: `2bb035b9a9337623a5478b1bbdb914fc83827c7e`
- P0: make the production migration runner enforce reverse repository/database parity.
- `migrate.sh` now fails closed if `schema_migrations` contains any filename absent from the exact checkout being deployed; unsafe path-like migration names are rejected as well.
- This closes a release hole exposed by the isolated restore drill: a database containing `221-stock-halt-cost-basis-settlement.sql` could previously pass `migrate.sh` when the checkout ended at migration 220.
- Existing checksum immutability and the narrowly documented 013→016 historical reconciliation remain unchanged.
- No database history is deleted, renamed, or rewritten. The unknown 221 lineage remains a separate reconciliation blocker.
