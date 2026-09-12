import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { rejectionOf } from '../testing/database';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function codeOf(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!MIGRATOR_DATABASE_URL)('business_settle_daily_v2 idempotency', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 3 });
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

  const member = async (client: PoolClient): Promise<string> => {
    const actor = randomUUID();
    await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
    await client.query(
      `INSERT INTO public.accounts (account_type, owner_user_id)
       VALUES ('USER_CASH', $1), ('USER_BANK', $1)`,
      [actor],
    );
    await client.query(
      `INSERT INTO public.account_balances (account_id)
       SELECT account_row.id
       FROM public.accounts AS account_row
       WHERE account_row.owner_user_id = $1`,
      [actor],
    );
    return actor;
  };

  const fund = async (client: PoolClient, actor: string, amount: number): Promise<void> => {
    const { rows } = await client.query<{ cash: string; mint: string }>(
      `SELECT
         (SELECT id::text FROM public.accounts
          WHERE owner_user_id = $1 AND account_type = 'USER_CASH') AS cash,
         (SELECT id::text FROM public.accounts
          WHERE system_key = 'mint' AND account_type = 'MINT') AS mint`,
      [actor],
    );
    await client.query(
      `SELECT public.economy_post_transaction(
         $1, 'ADMIN_ADJUSTMENT', $2, NULL,
         jsonb_build_array(
           jsonb_build_object('accountId', $3::uuid, 'amount', $5::bigint, 'direction', 'credit'),
           jsonb_build_object('accountId', $4::uuid, 'amount', $5::bigint, 'direction', 'debit')
         ),
         'test.business_settlement_v2.funded',
         '{}'::jsonb
       )`,
      [randomUUID(), actor, rows[0]?.mint, rows[0]?.cash, String(amount)],
    );
  };

  it('locks the idempotency key before reading its receipt', async () => {
    const { rows } = await pool.query<{ definition: string }>(
      `SELECT pg_catalog.pg_get_functiondef(
         'public.business_settle_daily_v2(uuid,uuid,uuid)'::pg_catalog.regprocedure
       ) AS definition`,
    );
    const definition = rows[0]?.definition ?? '';
    const lock = definition.indexOf('pg_advisory_xact_lock');
    const replay = definition.indexOf('FROM public.virtual_business_settlements AS settlement_row');
    expect(lock).toBeGreaterThanOrEqual(0);
    expect(replay).toBeGreaterThan(lock);
    expect(definition).toContain('moneyverse:business_settle_daily_v2:');
  });

  it('refuses replay of a settlement receipt owned by another user', async () => {
    await rolledBack(async (client) => {
      const owner = await member(client);
      const attacker = await member(client);
      await fund(client, owner, 100000);

      // Migration 101 adds a job-level purchase gate. Give this fixture enough
      // progression so the test reaches the settlement behavior it is about.
      await client.query(
        `INSERT INTO public.user_job_progress (user_id, job_type, experience, level)
         VALUES ($1, 'carrier'::public.work_job_type, 10000, 10)`,
        [owner],
      );

      const { rows: businesses } = await client.query<{ id: string }>(
        `SELECT id::text AS id
         FROM public.virtual_business_types
         WHERE symbol = 'CAFE'`,
      );
      const businessId = businesses[0]?.id;
      if (!businessId) throw new Error('seeded CAFE business is missing');

      const purchaseKey = randomUUID();
      const { rows: purchases } = await client.query<{ ownership_id: string }>(
        `SELECT ownership_id::text
         FROM public.business_purchase($1, $2, $3)`,
        [purchaseKey, owner, businessId],
      );
      const ownershipId = purchases[0]?.ownership_id;
      if (!ownershipId) throw new Error('business purchase returned no ownership');

      const settlementKey = randomUUID();
      await client.query(
        'SELECT * FROM public.business_settle_daily_v2($1, $2, $3)',
        [owner, ownershipId, settlementKey],
      );

      await client.query('SAVEPOINT before_refusal');
      const error = await rejectionOf(() =>
        client.query('SELECT * FROM public.business_settle_daily_v2($1, $2, $3)', [
          attacker,
          ownershipId,
          settlementKey,
        ]),
      );
      expect(codeOf(error)).toBe('28000');
      await client.query('ROLLBACK TO SAVEPOINT before_refusal');
      await client.query('RELEASE SAVEPOINT before_refusal');
    });
  });
});
