import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { isMissingGrant, rejectionOf } from '../testing/database';
import { SupportRepository } from './support.repository';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!MIGRATOR_DATABASE_URL)('bounded support order against isolated PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 }); });
  afterAll(async () => { await pool.end(); });

  it('orders recent owner conversations, excludes other members and denies raw support reads', async () => {
    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');
      const owner = randomUUID();
      const stranger = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES ($1),($2)', [owner, stranger]);
      const times = ['2026-10-28T10:00:00.000Z', '2026-10-29T10:00:00.000Z', '2026-10-30T10:00:00.000Z'];
      for (const [index, time] of times.entries()) {
        await client.query(`INSERT INTO public.support_threads(user_id,subject,create_key,last_message_at)
          VALUES ($1,$2,$3,$4)`, [owner, `billing ${index}`, randomUUID(), time]);
      }
      await client.query(`INSERT INTO public.support_threads(user_id,subject,create_key,last_message_at)
        VALUES ($1,$2,$3,$4)`, [stranger, 'billing secret', randomUUID(), '2026-10-27T10:00:00.000Z']);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repo = new SupportRepository(client);
      const sorted = await repo.myThreads(owner, null, 'billing', 'oldest');
      expect(sorted.map((thread) => thread.subject)).toEqual(['billing 0', 'billing 1', 'billing 2']);
      expect((await repo.myThreads(stranger, null, 'billing', 'oldest')).map((thread) => thread.subject)).toEqual(['billing secret']);
      expect((await repo.myThreads(owner, 'resolved', 'billing', 'oldest'))).toEqual([]);
      await client.query('SAVEPOINT raw_support_read');
      const refused = await rejectionOf(() => client.query('SELECT * FROM public.support_threads'));
      expect((refused as { code?: string }).code).toBe('42501');
      expect(isMissingGrant(refused)).toBe(true);
      await client.query('ROLLBACK TO SAVEPOINT raw_support_read');
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
