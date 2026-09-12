# Banking + Migration Parity — v2026.09.13.18

## Runtime
- Re-homes the Banking Safety Overview on current `main`.
- Makes the `/bank` surface explicitly virtual/simulated/game-only.
- Adds repayment-oriented guidance from authoritative banking standing without changing balances, rates, loan policy, bonds, APIs, or ledger behavior.

## Migration parity blocker repair
Current `main` contained two new migrations numbered `163` and no `179`, so the contiguous migration invariant failed in CI. The authoritative production checksum manifest ends at migration `046`, which proves both `163` files are outside the production-applied baseline represented by the repository. History also shows `163-merge-forked-member-accounts.sql` was introduced on 2026-09-06, while `163-local-email-auth.sql` was introduced later on 2026-09-12.

The later local-email migration is therefore moved to `179-local-email-auth.sql` without changing its SQL bytes. The earlier account-merge migration remains `163`. No production-applied migration from the checksum manifest is renamed or modified.

## Release policy
This candidate must pass exact-head CI, then immutable exact-SHA Test image build and isolated `wdmv-test` runtime verification before any main or Production promotion. Production is unchanged until those gates pass.
