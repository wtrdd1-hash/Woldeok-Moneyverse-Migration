import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

function message(error: unknown): string {
  return typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message?: unknown }).message)
    : '';
}

async function rejected(client: PoolClient, sql: string, params: readonly unknown[] = []): Promise<unknown> {
  await client.query('SAVEPOINT expected_refusal');
  try {
    await client.query(sql, params);
    await client.query('RELEASE SAVEPOINT expected_refusal');
    return null;
  } catch (error) {
    await client.query('ROLLBACK TO SAVEPOINT expected_refusal');
    return error;
  }
}

async function memberWithBalances(
  client: PoolClient,
  cash: bigint,
  bank: bigint,
): Promise<{ actor: string; bankAccount: string }> {
  const actor = randomUUID();
  await client.query('INSERT INTO public.users(id) VALUES ($1)', [actor]);
  const cashAccount = (
    await client.query<{ id: string }>(
      `INSERT INTO public.accounts(account_type, owner_user_id)
       VALUES ('USER_CASH', $1) RETURNING id`,
      [actor],
    )
  ).rows[0]?.id;
  const bankAccount = (
    await client.query<{ id: string }>(
      `INSERT INTO public.accounts(account_type, owner_user_id)
       VALUES ('USER_BANK', $1) RETURNING id`,
      [actor],
    )
  ).rows[0]?.id;
  if (!cashAccount || !bankAccount) throw new Error('bank test accounts were not created');
  await client.query(
    `INSERT INTO public.account_balances(account_id, available_amount)
     VALUES ($1, $2), ($3, $4)`,
    [cashAccount, cash.toString(), bankAccount, bank.toString()],
  );
  return { actor, bankAccount };
}

describe.skipIf(!MIGRATOR_DATABASE_URL)('balanced banking gameplay contract', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await body(client);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  };

  it('does not expose the deposit tracker table to the application role', async () => {
    await rolledBack(async (client) => {
      await client.query('SET LOCAL ROLE moneyverse_app');
      const error = await rejected(client, 'SELECT * FROM public.virtual_bank_deposit_trackers');
      expect(code(error)).toBe('42501');
      await client.query('RESET ROLE');
    });
  });

  it('does not mint a minimum 1 WLD when real accrued interest is below one', async () => {
    await rolledBack(async (client) => {
      const { actor } = await memberWithBalances(client, 100n, 1n);
      await client.query(
        `INSERT INTO public.virtual_bank_deposit_trackers(user_id, last_interest_claimed_at)
         VALUES ($1, clock_timestamp() - interval '1 hour')`,
        [actor],
      );
      await client.query('SET LOCAL ROLE moneyverse_app');
      const error = await rejected(
        client,
        'SELECT * FROM public.bank_claim_compound_interest($1, $2)',
        [actor, randomUUID()],
      );
      expect(code(error)).toBe('22023');
      expect(message(error)).toContain('has not reached 1 WLD');
      await client.query('RESET ROLE');
    });
  });

  it('starts a new interest interval whenever the deposit balance changes', async () => {
    await rolledBack(async (client) => {
      const { actor } = await memberWithBalances(client, 1000n, 1000n);
      await client.query(
        `INSERT INTO public.virtual_bank_deposit_trackers(user_id, last_interest_claimed_at)
         VALUES ($1, clock_timestamp() - interval '2 days')`,
        [actor],
      );
      const before = (
        await client.query<{ ts: Date }>(
          'SELECT last_interest_claimed_at AS ts FROM public.virtual_bank_deposit_trackers WHERE user_id=$1',
          [actor],
        )
      ).rows[0]?.ts;
      await client.query('SET LOCAL ROLE moneyverse_app');
      await client.query('SELECT public.bank_move_balance($1,$2,$3,$4)', [
        randomUUID(), actor, 'deposit', 100,
      ]);
      await client.query('RESET ROLE');
      const after = (
        await client.query<{ ts: Date }>(
          'SELECT last_interest_claimed_at AS ts FROM public.virtual_bank_deposit_trackers WHERE user_id=$1',
          [actor],
        )
      ).rows[0]?.ts;
      expect(before).toBeDefined();
      expect(after).toBeDefined();
      expect(after!.getTime()).toBeGreaterThan(before!.getTime());
    });
  });

  it('replays the same interest claim instead of paying or failing twice', async () => {
    await rolledBack(async (client) => {
      const { actor } = await memberWithBalances(client, 1000n, 100_000n);
      await client.query(
        `INSERT INTO public.virtual_bank_deposit_trackers(user_id, last_interest_claimed_at)
         VALUES ($1, clock_timestamp() - interval '1 day')`,
        [actor],
      );
      const key = randomUUID();
      await client.query('SET LOCAL ROLE moneyverse_app');
      const first = (
        await client.query<{ claimed_amount: string; transaction_id: string }>(
          'SELECT claimed_amount::text, transaction_id::text FROM public.bank_claim_compound_interest($1,$2)',
          [actor, key],
        )
      ).rows[0];
      const second = (
        await client.query<{ claimed_amount: string; transaction_id: string }>(
          'SELECT claimed_amount::text, transaction_id::text FROM public.bank_claim_compound_interest($1,$2)',
          [actor, key],
        )
      ).rows[0];
      await client.query('RESET ROLE');
      expect(first?.claimed_amount).toBe(second?.claimed_amount);
      expect(first?.transaction_id).toBe(second?.transaction_id);
      expect(BigInt(first?.claimed_amount ?? '0')).toBeGreaterThan(0n);
    });
  });

  it('reports the same effective deposit rate the claim function uses', async () => {
    await rolledBack(async (client) => {
      const { actor } = await memberWithBalances(client, 1000n, 1000n);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const standing = (
        await client.query<{ standing: Record<string, unknown>; rate: number }>(
          'SELECT public.bank_get_my_standing($1) AS standing, public.bank_auto_interest_rate_bps() AS rate',
          [actor],
        )
      ).rows[0];
      await client.query('RESET ROLE');
      expect(standing?.standing.daily_interest_rate_bps).toBe(standing?.rate);
      expect(typeof standing?.standing.cash_balance).toBe('string');
      expect(typeof standing?.standing.bank_balance).toBe('string');
      expect(typeof standing?.standing.credit_limit).toBe('string');
    });
  });
});
