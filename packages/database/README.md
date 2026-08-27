# Database

The schema is owned by the numbered SQL files in `migrations/`. Prisma
introspects it and never migrates it.

## Why the functions matter

The application connects as `moneyverse_app`. That role has no `UPDATE` on
`account_balances`, no `DELETE` on `audit_logs`, and no DML at all on
`user_restrictions`, `minecraft_operations`, `admin_action_policies`,
`virtual_bank_loans`, `virtual_business_ownerships`,
`virtual_stock_corporate_actions` or `work_reward_policy`. It holds `EXECUTE`
on the `SECURITY DEFINER` functions instead.

A full application compromise therefore still cannot move money or rewrite the
audit trail. Do not grant the role table-level DML to make a query easier.

The single function that moves money, `economy_post_transaction`, refuses to
commit unless debits equal credits, locks the affected accounts in `id` order
to avoid deadlock, rejects a negative balance on any account not marked
`allow_negative`, and writes the outbox event in the same transaction.

## Rules

- Add the next number. Never renumber, never edit an applied migration —
  `migrate.sh` compares a `sha256` and refuses a changed file.
- The range is contiguous: 002 through 046, 45 migrations, no gaps.
- Every `SECURITY DEFINER` function pins `search_path`. A test asserts this
  across all 45 migrations.
- Idempotency-key handling takes the lock *before* the replay check and
  verifies the replayed row belongs to the caller. Copy `shop_purchase`,
  `economy_claim_daily`, `economy_claim_work`, `021-work-reward.sql` or
  `044-member-board.sql`. If your version resembles none of them, you have
  misread one.

## The baseline is production, not a checkout

`production-checksums.json` holds the `sha256` of every migration recorded in
the live production database's `public.schema_migrations`. The parity test
compares the files here against that manifest.

This matters because the git branch this repository was ported from did not
contain 041, 042 or 043 at all, while production had all three applied. A
parity test that compared the port against that same checkout agreed with
itself and reported success. Comparing against the database is what surfaced
the gap.

Two of the three describe features the deployed application does not use —
`casino_play_coin` and the bank auto-interest accrual — but 043 redefines
`grant_bootstrap_discord_administrator`, which it does. All three must be
present regardless: a database rebuilt from this repository has to reach the
same schema production is on, and leaving 041–043 unused would let a future
migration silently claim one of those numbers.

## Prisma

`prisma/schema.prisma` carries the generator and datasource blocks but no
models yet: introspection needs a live database.

```bash
DATABASE_URL=... pnpm --filter @moneyverse/database introspect
```

Commit the generated models in their own commit. Never run a Prisma
migration — CI fails the build if the phrase appears in a script or manifest.

## Local development

Requires a container runtime, which the current development machine does not
have. Where one is available:

```bash
cp .env.example .env      # set real passwords
docker compose -f compose.yml up -d
```

Without one, database-backed tests skip locally and run in CI, which has a
PostgreSQL service. A skipped test is never reported as a passing one.
