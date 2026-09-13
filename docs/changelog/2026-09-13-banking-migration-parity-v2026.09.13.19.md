# Banking + Migration Parity — v2026.09.13.19

## Runtime
- Re-homes the Banking Safety Overview on current `main` `6ad8304ac743366ae8b9bc445934160b0eaecdee`.
- Makes `/bank` explicitly virtual/simulated/game-only and adds repayment-oriented guidance from authoritative banking standing.
- Preserves BigInt/integer-string WLD arithmetic and does not change ledger, balance, rate, loan-policy, bond, or API behavior.

## Migration parity repair
- Keeps the earlier `163-merge-forked-member-accounts.sql` migration at 163.
- Moves the later local-email migration to `179-local-email-auth.sql` with its SQL body unchanged.
- The production checksum manifest ends before these migrations, so no production-applied migration is renamed or edited.

## Release gate
Exact-head CI must pass, then the same immutable SHA must be built and verified in isolated `wdmv-test`. No Production promotion occurs without exact-SHA runtime, migration, API/UI, log, and rollback evidence.
