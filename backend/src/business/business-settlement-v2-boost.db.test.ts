import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!MIGRATOR_DATABASE_URL)('business_settle_daily_v2 boosts', () => {
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

  const buyCafe = async (client: PoolClient): Promise<{ actor: string; ownershipId: string }> => {
    const actor = randomUUID();
    await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
    await client.query(
      `INSERT INTO public.accounts (account_type, owner_user_id)
       VALUES ('USER_CASH', $1), ('USER_BANK', $1)`,
      [actor],
    );
    await client.query(
      `INSERT INTO public.account_balances (account_id)
       SELECT id FROM public.accounts WHERE owner_user_id = $1`,
      [actor],
    );
    await client.query(
      `INSERT INTO public.user_job_progress (user_id, job_type, experience, level)
       VALUES ($1, 'carrier'::public.work_job_type, 10000, 10)`,
      [actor],
    );

    const { rows: accounts } = await client.query<{ cash: string; mint: string }>(
      `SELECT
         (SELECT id::text FROM public.accounts WHERE owner_user_id = $1 AND account_type = 'USER_CASH') AS cash,
         (SELECT id::text FROM public.accounts WHERE system_key = 'mint' AND account_type = 'MINT') AS mint`,
      [actor],
    );
    await client.query(
      `SELECT public.economy_post_transaction(
         $1, 'ADMIN_ADJUSTMENT', $2, NULL,
         jsonb_build_array(
           jsonb_build_object('accountId', $3::uuid, 'amount', 100000::bigint, 'direction', 'credit'),
           jsonb_build_object('accountId', $4::uuid, 'amount', 100000::bigint, 'direction', 'debit')
         ),
         'test.business_settlement_v2_boost.funded', '{}'::jsonb
       )`,
      [randomUUID(), actor, accounts[0]?.mint, accounts[0]?.cash],
    );

    const { rows: businesses } = await client.query<{ id: string }>(
      `SELECT id::text AS id FROM public.virtual_business_types WHERE symbol = 'CAFE'`,
    );
    const businessId = businesses[0]?.id;
    if (!businessId) throw new Error('seeded CAFE business is missing');

    const { rows: purchases } = await client.query<{ ownership_id: string }>(
      `SELECT ownership_id::text FROM public.business_purchase($1, $2, $3)`,
      [randomUUID(), actor, businessId],
    );
    const ownershipId = purchases[0]?.ownership_id;
    if (!ownershipId) throw new Error('business purchase returned no ownership');
    return { actor, ownershipId };
  };

  it.each([
    ['active multipliers', { revenue_mult: 2, cost_mult: 0.5 }, 2, 0.5],
    ['missing revenue multiplier', { cost_mult: 0.5 }, 1, 0.5],
    ['missing cost multiplier', { revenue_mult: 2 }, 2, 1],
  ] as const)('settles with %s', async (_label, boost, revenueMult, costMult) => {
    await rolledBack(async (client) => {
      const { actor, ownershipId } = await buyCafe(client);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await client.query(
        `UPDATE public.virtual_business_ownerships
         SET boost_active = $2::jsonb
         WHERE id = $1`,
        [ownershipId, JSON.stringify({ ...boost, expires_at: expiresAt })],
      );

      const { rows: base } = await client.query<{ revenue: string; cost: string }>(
        `SELECT bt.daily_revenue::text AS revenue, bt.daily_operating_cost::text AS cost
         FROM public.virtual_business_ownerships bo
         JOIN public.virtual_business_types bt ON bt.id = bo.business_type_id
         WHERE bo.id = $1`,
        [ownershipId],
      );
      const { rows } = await client.query<{ gross_revenue: string; operating_cost: string; net_amount: string }>(
        'SELECT gross_revenue::text, operating_cost::text, net_amount::text FROM public.business_settle_daily_v2($1, $2, $3)',
        [actor, ownershipId, randomUUID()],
      );
      const expectedGross = Math.round(Number(base[0]?.revenue) * revenueMult);
      const expectedCost = Math.round(Number(base[0]?.cost) * costMult);
      expect(rows[0]?.gross_revenue).toBe(String(expectedGross));
      expect(rows[0]?.operating_cost).toBe(String(expectedCost));
      expect(rows[0]?.net_amount).toBe(String(expectedGross - expectedCost));
    });
  });

  it('ignores an expired boost', async () => {
    await rolledBack(async (client) => {
      const { actor, ownershipId } = await buyCafe(client);
      await client.query(
        `UPDATE public.virtual_business_ownerships
         SET boost_active = $2::jsonb
         WHERE id = $1`,
        [ownershipId, JSON.stringify({ revenue_mult: 9, cost_mult: 9, expires_at: '2000-01-01T00:00:00Z' })],
      );
      const { rows: base } = await client.query<{ revenue: string; cost: string }>(
        `SELECT bt.daily_revenue::text AS revenue, bt.daily_operating_cost::text AS cost
         FROM public.virtual_business_ownerships bo
         JOIN public.virtual_business_types bt ON bt.id = bo.business_type_id
         WHERE bo.id = $1`,
        [ownershipId],
      );
      const { rows } = await client.query<{ gross_revenue: string; operating_cost: string }>(
        'SELECT gross_revenue::text, operating_cost::text FROM public.business_settle_daily_v2($1, $2, $3)',
        [actor, ownershipId, randomUUID()],
      );
      expect(rows[0]?.gross_revenue).toBe(base[0]?.revenue);
      expect(rows[0]?.operating_cost).toBe(base[0]?.cost);
    });
  });
});
