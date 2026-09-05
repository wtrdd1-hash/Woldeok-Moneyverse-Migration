import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';
import { PostgresStockRepository } from './stock.repository';

/**
 * Migration 124, executed.
 *
 * The walk is stochastic, so what is asserted is what must hold whatever the
 * dice say: the state rows exist, a tick keeps every price inside the day's
 * band, a halted market does not move, and the news functions keep their
 * promises about who may publish and what a member sees.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the market dynamics against a real database', () => {
  let pool: Pool;
  let stocks: PostgresStockRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
    stocks = new PostgresStockRepository(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the state tables unreadable by the application role', async () => {
    for (const table of [
      'virtual_stock_market_params',
      'virtual_stock_market_regime',
      'virtual_stock_dynamics',
      'virtual_stock_market_events',
    ]) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  it('grants the reads and the writes, and never the dice', async () => {
    const granted = await pool.query<{ signature: string; has: boolean }>(
      `SELECT signature, has_function_privilege('moneyverse_app', signature, 'EXECUTE') AS has
       FROM unnest($1::text[]) AS signature`,
      [
        [
          'public.stock_market_live_tick()',
          'public.stock_trade(uuid, uuid, uuid, text, bigint)',
          'public.stock_market_events_active()',
          'public.stock_market_events_admin_list(uuid, integer)',
          'public.stock_market_dynamics_admin(uuid)',
          'public.stock_market_event_publish(uuid, uuid, uuid, text, integer, integer, text, text, text)',
          'public.stock_market_event_cancel(uuid, uuid, uuid)',
          'public.stock_market_gaussian()',
          'public.stock_market_halted()',
        ],
      ],
    );
    const held = new Map(granted.rows.map((row) => [row.signature, row.has]));
    expect(held.get('public.stock_market_live_tick()')).toBe(true);
    expect(held.get('public.stock_trade(uuid, uuid, uuid, text, bigint)')).toBe(true);
    expect(held.get('public.stock_market_events_active()')).toBe(true);
    expect(held.get('public.stock_market_events_admin_list(uuid, integer)')).toBe(true);
    expect(held.get('public.stock_market_dynamics_admin(uuid)')).toBe(true);
    expect(
      held.get('public.stock_market_event_publish(uuid, uuid, uuid, text, integer, integer, text, text, text)'),
    ).toBe(true);
    expect(held.get('public.stock_market_event_cancel(uuid, uuid, uuid)')).toBe(true);
    // Internal to the tick. Nothing outside it has a reason to roll.
    expect(held.get('public.stock_market_gaussian()')).toBe(false);
    expect(held.get('public.stock_market_halted()')).toBe(false);
  });

  it('answers a member with the running events, as the repository asks', async () => {
    await expect(stocks.marketEvents()).resolves.toBeInstanceOf(Array);
  });

  it('refuses to publish, list or read the dynamics without the operator role', async () => {
    await expect(
      stocks.publishMarketEvent({
        userId: UNKNOWN,
        direction: 'up',
        strength: 1,
        hours: 1,
        headline: 'a stranger writes the news',
      }),
    ).rejects.toMatchObject({ code: '42501' });
    await expect(stocks.adminMarketEvents(UNKNOWN)).rejects.toMatchObject({ code: '42501' });
    await expect(stocks.adminDynamics(UNKNOWN)).rejects.toMatchObject({ code: '42501' });
  });

  it('ticks: every price stays inside the day band and the dynamics row appears', async () => {
    const moved = await stocks.liveTick();
    expect(moved).toBeGreaterThanOrEqual(0);
    const listed = await stocks.list();
    expect(moved).toBeLessThanOrEqual(listed.length);
    for (const row of listed) {
      const open = BigInt(row.day_open_price);
      const price = BigInt(row.current_price);
      expect(price >= (open * 7n) / 10n, `${row.symbol} fell through the floor`).toBe(true);
      expect(price <= (open * 13n) / 10n, `${row.symbol} broke the ceiling`).toBe(true);
    }
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('what an operator can do, and what a halt does', () => {
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

    const operator = async (client: PoolClient): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      await client.query("INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'operator')", [id]);
      return id;
    };

    const listing = async (client: PoolClient, price: number): Promise<string> => {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO public.virtual_stocks (symbol, name, description, initial_price, current_price, day_open_price)
         VALUES ($1, 'Dynamics test', '', $2, $2, $2) RETURNING id`,
        [`T${Math.floor(Math.random() * 1_000_000).toString(36).toUpperCase().slice(0, 6)}`, price],
      );
      return rows[0]!.id;
    };

    it('publishes once per key, shows the event to members, and cancels it once', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        const stock = await listing(client, 100_000);
        const key = randomUUID();
        const first = await client.query<{ event_id: string; replayed: boolean }>(
          'SELECT event_id, replayed FROM public.stock_market_event_publish($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [key, actor, stock, 'up', 2, 6, '신제품 발표', '', 'operator'],
        );
        expect(first.rows[0]?.replayed).toBe(false);

        const again = await client.query<{ event_id: string; replayed: boolean }>(
          'SELECT event_id, replayed FROM public.stock_market_event_publish($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [key, actor, stock, 'up', 2, 6, '신제품 발표', '', 'operator'],
        );
        expect(again.rows[0]).toEqual({ event_id: first.rows[0]?.event_id, replayed: true });

        const running = await client.query<{ id: string; drift: string }>(
          'SELECT id FROM public.stock_market_events_active()',
        );
        expect(running.rows.map((row) => row.id)).toContain(first.rows[0]?.event_id);

        const cancelled = await client.query<{ cancelled: boolean }>(
          'SELECT public.stock_market_event_cancel($1,$2,$3) AS cancelled',
          [randomUUID(), actor, first.rows[0]?.event_id],
        );
        expect(cancelled.rows[0]?.cancelled).toBe(true);
        const twice = await client.query<{ cancelled: boolean }>(
          'SELECT public.stock_market_event_cancel($1,$2,$3) AS cancelled',
          [randomUUID(), actor, first.rows[0]?.event_id],
        );
        expect(twice.rows[0]?.cancelled).toBe(false);

        const after = await client.query<{ id: string }>('SELECT id FROM public.stock_market_events_active()');
        expect(after.rows.map((row) => row.id)).not.toContain(first.rows[0]?.event_id);
      });
    });

    it('draws the preview line from minutes rather than from ticks', async () => {
      // 136. The line used to be the last N rows of virtual_stock_price_ticks
      // -- the last N *changes* -- which under 124's per-second walk is forty
      // seconds for a stock priced in tens of thousands, normalised to its own
      // extremes and drawn as a saw. One close per minute is a window that
      // does not depend on the price level or on how often the tick fires.
      await rolledBack(async (client) => {
        const stock = await listing(client, 1000);
        const minute = (index: number, close: number): Promise<unknown> =>
          client.query(
            `INSERT INTO public.virtual_stock_minute_candles
               (stock_id, bucket_at, open_price, high_price, low_price, close_price)
             VALUES ($1, date_trunc('minute', now()) - make_interval(mins => $2::int), $3, $3, $3, $3)`,
            [stock, index, close],
          );
        await minute(2, 1000);
        await minute(1, 1010);
        await minute(0, 1020);
        // Ticks in the same window, which must not reach the line: there are
        // more of them than there are minutes, and that was the whole bug.
        for (const price of [1017, 1018, 1019, 1020]) {
          await client.query(
            'INSERT INTO public.virtual_stock_price_ticks (stock_id, price) VALUES ($1, $2)',
            [stock, price],
          );
        }

        const { rows } = await client.query<{ stock_id: string; prices: string[] }>(
          'SELECT stock_id::text, prices::text[] AS prices FROM public.stock_spark_series($1)',
          [60],
        );
        const line = rows.find((row) => row.stock_id === stock);
        // Most recent first, as the API's contract says and the figure reads.
        expect(line?.prices).toEqual(['1020', '1010', '1000']);
      });
    });

    it('sizes a strength by the vocabulary, not by the caller', async () => {
      await rolledBack(async (client) => {
        const actor = await operator(client);
        for (const [strength, drift, vol] of [
          [1, '300', '1.2'],
          [2, '800', '1.5'],
          [3, '2000', '2.0'],
        ] as const) {
          const { rows } = await client.query<{ event_id: string }>(
            'SELECT event_id FROM public.stock_market_event_publish($1,$2,$3,$4,$5,$6,$7,$8,$9)',
            [randomUUID(), actor, null, 'down', strength, 1, `악재 ${strength}`, '', 'operator'],
          );
          const stored = await client.query<{ drift_bps_per_day: string; vol_multiplier: string }>(
            'SELECT drift_bps_per_day::text, vol_multiplier::text FROM public.virtual_stock_market_events WHERE id = $1',
            [rows[0]?.event_id],
          );
          expect(stored.rows[0]).toEqual({ drift_bps_per_day: `-${drift}`, vol_multiplier: vol });
        }
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.stock_market_event_publish($1,$2,$3,$4,$5,$6,$7,$8,$9)', [
            randomUUID(), actor, null, 'up', 4, 1, 'too strong', '', 'operator',
          ]),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('seeds a dynamics row for a new listing on its first tick and keeps the exact price beside the integer', async () => {
      await rolledBack(async (client) => {
        const stock = await listing(client, 1_000);
        await client.query('SELECT public.stock_market_live_tick()');
        const { rows } = await client.query<{ price_exact: string; fair_value: string; current_price: string }>(
          `SELECT dynamics.price_exact::text, dynamics.fair_value::text, stock.current_price::text
           FROM public.virtual_stock_dynamics AS dynamics
           JOIN public.virtual_stocks AS stock ON stock.id = dynamics.stock_id
           WHERE dynamics.stock_id = $1`,
          [stock],
        );
        expect(rows).toHaveLength(1);
        expect(Math.round(Number(rows[0]?.price_exact))).toBe(Number(rows[0]?.current_price));
        expect(Number(rows[0]?.fair_value)).toBeGreaterThanOrEqual(10);
      });
    });

    /** An active member with cash: the shop test's fixture, for the same reason it exists there. */
    const member = async (client: PoolClient, funds: number): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      await client.query(
        `INSERT INTO public.accounts (account_type, owner_user_id) VALUES ('USER_CASH', $1), ('USER_BANK', $1)`,
        [id],
      );
      await client.query(
        `INSERT INTO public.account_balances (account_id)
         SELECT account_row.id FROM public.accounts AS account_row WHERE account_row.owner_user_id = $1`,
        [id],
      );
      const { rows } = await client.query<{ cash: string; mint: string }>(
        `SELECT
           (SELECT id::text FROM public.accounts WHERE owner_user_id = $1 AND account_type = 'USER_CASH') AS cash,
           (SELECT id::text FROM public.accounts WHERE system_key = 'mint') AS mint`,
        [id],
      );
      await client.query(
        `SELECT public.economy_post_transaction(
           $1, 'ADMIN_ADJUSTMENT', $2, NULL,
           jsonb_build_array(
             jsonb_build_object('accountId', $3::uuid, 'amount', $5::bigint, 'direction', 'credit'),
             jsonb_build_object('accountId', $4::uuid, 'amount', $5::bigint, 'direction', 'debit')
           ),
           'test.funded', '{}'::jsonb)`,
        [randomUUID(), id, rows[0]?.mint, rows[0]?.cash, funds],
      );
      return id;
    };

    const cash = async (client: PoolClient, actor: string): Promise<bigint> => {
      const { rows } = await client.query<{ available_amount: string }>(
        `SELECT balance_row.available_amount::text
         FROM public.account_balances AS balance_row
         JOIN public.accounts AS account_row ON account_row.id = balance_row.account_id
         WHERE account_row.owner_user_id = $1 AND account_row.account_type = 'USER_CASH'::public.account_type`,
        [actor],
      );
      return BigInt(rows[0]?.available_amount ?? '0');
    };

    /**
     * The order fills at the price it moved to, so a round trip costs money.
     * Filling at the quoted price and moving afterwards would let a member
     * buy three percent of the float at 100, sell it at the 105 that buy
     * produced, and keep the difference from the sink -- without limit.
     */
    it('makes the taker pay the impact, so buying and selling back loses', async () => {
      await rolledBack(async (client) => {
        const stock = await listing(client, 100);
        const actor = await member(client, 10_000_000);
        const before = await cash(client, actor);

        // 3.33 % of the default million-share float: past the 5 % cap.
        const bought = await client.query<{ unit_price: string; current_price: string }>(
          'SELECT unit_price::text, current_price::text FROM public.stock_trade($1,$2,$3,$4,$5)',
          [randomUUID(), actor, stock, 'buy', 33_334],
        );
        expect(bought.rows[0]).toEqual({ unit_price: '105', current_price: '105' });

        const sold = await client.query<{ unit_price: string; current_price: string }>(
          'SELECT unit_price::text, current_price::text FROM public.stock_trade($1,$2,$3,$4,$5)',
          [randomUUID(), actor, stock, 'sell', 33_334],
        );
        // 105 pushed down five percent, rounded: the seller gets 100, not 105.
        expect(sold.rows[0]).toEqual({ unit_price: '100', current_price: '100' });

        expect((await cash(client, actor)) < before).toBe(true);
      });
    });

    it('does not move while the circuit breaker is thrown, and refuses a trade', async () => {
      await rolledBack(async (client) => {
        const stock = await listing(client, 50_000);
        await client.query('UPDATE public.admin_economy_policy_v2 SET market_circuit_broken = true WHERE id = 1');
        const { rows } = await client.query<{ moved: number }>('SELECT public.stock_market_live_tick() AS moved');
        expect(rows[0]?.moved).toBe(0);
        const price = await client.query<{ current_price: string }>(
          'SELECT current_price::text FROM public.virtual_stocks WHERE id = $1',
          [stock],
        );
        expect(price.rows[0]?.current_price).toBe('50000');

        const actor = await operator(client);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.stock_trade($1,$2,$3,$4,$5)', [randomUUID(), actor, stock, 'buy', 1]),
        );
        expect(code(error)).toBe('55000');
      });
    });
  });
});
