import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { rejectionOf } from '../testing/database';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

interface HistoryRow {
  readonly play_id: string;
  readonly game: string;
  readonly choice: string;
  readonly outcome: string;
  readonly stake_amount: string;
  readonly net_amount: string;
  readonly transaction_id: string;
  readonly played_at: Date;
}

describe.skipIf(!MIGRATOR_DATABASE_URL)('casino history read model', () => {
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

  async function transaction(client: PoolClient, actor: string, type: string): Promise<string> {
    const id = randomUUID();
    await client.query(
      `INSERT INTO public.ledger_transactions
         (id, idempotency_key, type, actor_user_id, request_hash)
       VALUES ($1, $2, $3, $4, decode(repeat('00', 32), 'hex'))`,
      [id, randomUUID(), type, actor],
    );
    return id;
  }

  it('returns the caller coin and dice plays newest first and excludes another member', async () => {
    await rolledBack(async (client) => {
      const actor = randomUUID();
      const other = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1), ($2)', [actor, other]);

      const coinTx = await transaction(client, actor, 'VIRTUAL_COIN_GAME');
      const diceTx = await transaction(client, actor, 'VIRTUAL_DICE_GAME');
      const otherTx = await transaction(client, other, 'VIRTUAL_DICE_GAME');

      await client.query(
        `INSERT INTO public.virtual_casino_coin_plays
           (idempotency_key, user_id, play_date, choice, outcome, stake_amount, net_amount,
            transaction_id, created_at)
         VALUES ($1, $2, CURRENT_DATE, 'heads', 'tails', 10, -10, $3,
                 clock_timestamp() - interval '2 minutes')`,
        [randomUUID(), actor, coinTx],
      );
      await client.query(
        `INSERT INTO public.virtual_casino_dice_plays
           (idempotency_key, user_id, play_date, game, choice, outcome, stake_amount, net_amount,
            transaction_id, created_at)
         VALUES ($1, $2, CURRENT_DATE, 'dice_parity', 'odd', 3, 10, 9, $3,
                 clock_timestamp() - interval '1 minute')`,
        [randomUUID(), actor, diceTx],
      );
      await client.query(
        `INSERT INTO public.virtual_casino_dice_plays
           (idempotency_key, user_id, play_date, game, choice, outcome, stake_amount, net_amount,
            transaction_id, created_at)
         VALUES ($1, $2, CURRENT_DATE, 'dice_number', '6', 2, 10, -10, $3,
                 clock_timestamp())`,
        [randomUUID(), other, otherTx],
      );

      const { rows } = await client.query<HistoryRow>(
        `SELECT play_id::text, game, choice, outcome,
                stake_amount::text, net_amount::text, transaction_id::text, played_at
         FROM public.member_casino_history($1::uuid, 20)`,
        [actor],
      );

      expect(rows).toHaveLength(2);
      expect(rows.map((row) => row.game)).toEqual(['dice_parity', 'coin']);
      expect(rows[0]).toMatchObject({ choice: 'odd', outcome: '3', stake_amount: '10', net_amount: '9' });
      expect(rows[1]).toMatchObject({ choice: 'heads', outcome: 'tails', stake_amount: '10', net_amount: '-10' });
      expect(rows.every((row) => row.transaction_id === diceTx || row.transaction_id === coinTx)).toBe(true);
    });
  });

  it('bounds the requested history length', async () => {
    await rolledBack(async (client) => {
      const actor = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
      const error = await rejectionOf(() =>
        client.query('SELECT * FROM public.member_casino_history($1::uuid, 0)', [actor]),
      );
      expect(error).toMatchObject({ code: '22023' });
    });
  });

  it('keeps play tables private while granting only the actor-scoped read function', async () => {
    const { rows } = await pool.query<{
      coin_select: boolean;
      dice_select: boolean;
      history_execute: boolean;
    }>(
      `SELECT has_table_privilege('moneyverse_app', 'public.virtual_casino_coin_plays', 'SELECT') AS coin_select,
              has_table_privilege('moneyverse_app', 'public.virtual_casino_dice_plays', 'SELECT') AS dice_select,
              has_function_privilege('moneyverse_app', 'public.member_casino_history(uuid,integer)', 'EXECUTE') AS history_execute`,
    );
    expect(rows[0]).toEqual({ coin_select: false, dice_select: false, history_execute: true });
  });

  it('does not advertise unimplemented follow-up effects as pending rewards', async () => {
    const { rows } = await pool.query<{ code: string; pending_effect: string | null }>(
      `SELECT code, pending_effect
       FROM public.early_event_catalog
       WHERE code = ANY(ARRAY['tool_breakdown','rainy_day','lucky_box'])
       ORDER BY code`,
    );
    expect(rows).toEqual([
      { code: 'lucky_box', pending_effect: null },
      { code: 'rainy_day', pending_effect: null },
      { code: 'tool_breakdown', pending_effect: null },
    ]);
  });
});
