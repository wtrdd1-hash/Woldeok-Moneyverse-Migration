import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from './testing/database';

/**
 * Migration 099, executed.
 *
 * 060 paid even money against a fair coin, which is a house edge of exactly
 * zero: the game returned every WLD it took and retired none. Specification
 * 15.1 wants daily burn at 60-90% of issuance and chapter 6 lists SINK as a
 * burn account; a casino that recycles nothing serves neither.
 *
 * So what is asserted here is the arithmetic a member is shown, and that it
 * is the same arithmetic the ledger settles at. The two were one number
 * before and are two now, which is precisely when they start to disagree.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)('the casino as a sink', () => {
  let migrator: Pool;

  beforeAll(() => {
    migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    await migrator.end();
  });

  const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
    const client = await migrator.connect();
    try {
      await client.query('BEGIN');
      await body(client);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  };

  /** A funded member, with the casino open. */
  const player = async (client: PoolClient): Promise<string> => {
    // The production switch correctly refuses to open without distribution
    // evidence. This test is about payout arithmetic, not the trial runner, so
    // provide deterministic passing evidence inside the rolled-back fixture.
    await client.query(
      `INSERT INTO public.casino_coin_distribution_trials (
         idempotency_key, trials, heads, expected_win_probability_ppm,
         observed_win_probability_ppm, z_score, tolerance_sigma, passed
       ) VALUES ($1, 1000000, 500000, 500000, 500000, 0, 5, true)`,
      [randomUUID()],
    );
    await client.query(
      "UPDATE public.feature_switches SET state = 'enabled' WHERE feature_key = 'casino'",
    );
    const id = randomUUID();
    await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO public.accounts (account_type, owner_user_id) VALUES ('USER_CASH', $1)
       RETURNING id`,
      [id],
    );
    await client.query('INSERT INTO public.account_balances (account_id) VALUES ($1)', [
      rows[0]?.id,
    ]);
    await client.query(
      `SELECT public.economy_post_transaction(
         $1, 'ADMIN_ADJUSTMENT', $2, NULL,
         jsonb_build_array(
           jsonb_build_object('accountId', (SELECT id FROM public.accounts WHERE system_key = 'mint'),
                              'amount', 100000, 'direction', 'credit'),
           jsonb_build_object('accountId', $3::uuid, 'amount', 100000, 'direction', 'debit')
         ), 'test.funded', '{}'::jsonb)`,
      [randomUUID(), id, rows[0]?.id],
    );
    return id;
  };

  /**
   * The whole point of the change, as one number. 50% at 1.9x leaves 5%.
   * A regression to even money puts this back to zero.
   */
  it('discloses a house edge of exactly five percent', async () => {
    await rolledBack(async (client) => {
      const actor = await player(client);
      const { rows } = await client.query<{
        house_edge_ppm: number;
        payout_multiplier_ppm: number;
      }>('SELECT house_edge_ppm, payout_multiplier_ppm FROM public.casino_coin_terms($1)', [actor]);
      expect(rows[0]?.payout_multiplier_ppm).toBe(1_900_000);
      expect(rows[0]?.house_edge_ppm).toBe(50_000);
    });
  });

  it('keeps the coin itself exactly fair', async () => {
    const { rows } = await migrator.query<{ ppm: number }>(
      'SELECT public.casino_coin_win_probability_ppm() AS ppm',
    );
    // 14.3 fixes the odds at 50:50. The edge comes from the payout, never
    // from the coin, and that distinction is a legal one.
    expect(rows[0]?.ppm).toBe(500_000);
  });

  it('rounds a payout down rather than minting the fraction', async () => {
    const { rows } = await migrator.query<{ hundred: string; fifteen: string; ten: string }>(
      `SELECT public.casino_net_win(100, 1900000)::text AS hundred,
              public.casino_net_win(15, 1900000)::text AS fifteen,
              public.casino_net_win(10, 1900000)::text AS ten`,
    );
    expect(rows[0]?.hundred).toBe('90');
    // 15 x 1.9 = 28.5, so the net is 13 and not 13.5. Down, because rounding
    // up would create currency out of arithmetic.
    expect(rows[0]?.fifteen).toBe('13');
    expect(rows[0]?.ten).toBe('9');
  });

  it('refuses a payout that would stop the game being a sink', async () => {
    await rolledBack(async (client) => {
      for (const multiplier of [2_000_000, 2_500_000, 1_000_000]) {
        // A savepoint per attempt: a raised statement aborts the transaction,
        // and every query after it answers 25P02 rather than the constraint
        // violation the next case is looking for.
        await client.query('SAVEPOINT try_multiplier');
        const error = await rejectionOf(() =>
          client.query('UPDATE public.casino_policy SET payout_multiplier_ppm = $1', [multiplier]),
        );
        await client.query('ROLLBACK TO SAVEPOINT try_multiplier');
        expect((error as { code?: string }).code, `${multiplier}`).toBe('23514');
      }
    });
  });

  it('carries per-play bounds without a reachable platform daily ceiling', async () => {
    const { rows } = await migrator.query<{
      min_stake: string;
      max_stake: string;
      daily_stake_limit: string;
    }>(
      `SELECT min_stake::text, max_stake::text, daily_stake_limit::text
       FROM public.casino_policy WHERE singleton`,
    );
    expect(rows[0]).toEqual({
      min_stake: '10',
      max_stake: '200',
      daily_stake_limit: '2000',
    });
  });

  /**
   * The posting moves what the member actually gained or lost. Under even
   * money the stake and the net were the same number and 060 posted the
   * stake; they are different now, and posting the stake on a win would mint
   * 100 where the member is owed 90.
   */
  it('posts the net, not the stake, and the ledger balances', async () => {
    await rolledBack(async (client) => {
      const actor = await player(client);
      const { rows } = await client.query<{ net_amount: string; transaction_id: string }>(
        `SELECT net_amount::text, transaction_id::text
         FROM public.casino_play_coin($1, $2, 'heads', 100)`,
        [randomUUID(), actor],
      );
      const net = Number(rows[0]?.net_amount);
      // A win nets +90 against a stake of 100; a loss still costs the lot.
      expect([90, -100]).toContain(net);

      const { rows: postings } = await client.query<{ amount: string; direction: string }>(
        'SELECT amount::text, direction FROM public.ledger_postings WHERE transaction_id = $1',
        [rows[0]?.transaction_id],
      );
      expect(postings).toHaveLength(2);
      for (const posting of postings) expect(posting.amount).toBe(String(Math.abs(net)));
      expect(new Set(postings.map((posting) => posting.direction)).size).toBe(2);
    });
  });

  it('publishes the balanced daily exposure policy', async () => {
    await rolledBack(async (client) => {
      const actor = await player(client);
      const { rows } = await client.query<{ daily_stake_limit: string; daily_loss_limit: string }>(
        `SELECT daily_stake_limit::text, daily_loss_limit::text
         FROM public.casino_coin_terms($1)`,
        [actor],
      );
      expect(rows[0]?.daily_stake_limit).toBe('2000');
      expect(rows[0]?.daily_loss_limit).toBe('1000');
    });
  });

  it.each([9, 201])('refuses a stake of %i, outside the policy range', async (stake) => {
    await rolledBack(async (client) => {
      const actor = await player(client);
      const error = await rejectionOf(() =>
        client.query(`SELECT public.casino_play_coin($1, $2, 'heads', $3)`, [
          randomUUID(),
          actor,
          stake,
        ]),
      );
      expect((error as { code?: string }).code).toBe('22023');
    });
  });
});
