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
- The range is contiguous: 002 through the newest file, no gaps and no
  repeated numbers. `test/migration-parity.test.ts` asserts it, which is also
  why two branches cannot both claim the next number — stack them instead.
  (This line read "002 through 046, 45 migrations" long after that stopped
  being true, so it says the rule now rather than a count that goes stale on
  the next merge.)
- Every `SECURITY DEFINER` function pins `search_path`. The same test asserts
  that across every migration.
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

## No ORM

Access is through `pg` and nothing else. An ORM was considered and measured
against this schema rather than assumed:

| | |
| --- | --- |
| Tables in `public` | 52 |
| Tables `moneyverse_app` may SELECT | 11 |
| Tables it may INSERT / UPDATE / DELETE | 3 / 3 / 0 |
| Functions it may EXECUTE | 69 |
| Repository code: function calls vs plain table reads | 46 vs 8 |

An ORM here would generate 52 models to serve 8 queries against 11 tables of
internal plumbing, and the row types those 8 need are already hand-declared
next to the migration that defines their columns. The cost — a query engine
binary, a generate step, and a standing risk that someone runs a schema
migration through it — bought nothing.

Row interfaces are assertions about the schema, not proofs. Annotate each one
with the migration that defines its columns, as the existing repositories do.

CI still refuses any reference to a Prisma migration command, so
reintroducing one is a deliberate act rather than an accident.

## Local development

The development machine has no container runtime. Two ways to get a database:

**A container elsewhere.** Build one from `init/` plus `migrations/` and reach
it over an SSH tunnel:

```bash
ssh -N -L 15439:127.0.0.1:5439 <host> &
printf 'DATABASE_URL=postgresql://moneyverse_app:...@127.0.0.1:15439/<db>\n' > .env
```

`.env` is gitignored. Point it at a scratch database, never at production.

**Locally, where a runtime exists:**

```bash
cp .env.example .env      # set real passwords
docker compose -f compose.yml up -d
```

Database-backed tests skip without `DATABASE_URL` rather than failing, and
also run in CI, which has a PostgreSQL service. A skipped test is never
reported as a passing one.
