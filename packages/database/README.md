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
- The numbering skips 041, 042 and 043. That gap is deliberate; numbers are
  never reused.
- Every `SECURITY DEFINER` function pins `search_path`. A test asserts this
  across all 42 migrations.
- Idempotency-key handling takes the lock *before* the replay check and
  verifies the replayed row belongs to the caller. Copy `shop_purchase`,
  `economy_claim_daily`, `economy_claim_work`, `021-work-reward.sql` or
  `044-member-board.sql`. If your version resembles none of them, you have
  misread one.

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
