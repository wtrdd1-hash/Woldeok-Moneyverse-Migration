import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { rejectionOf } from '../testing/database';
import { SupportRepository } from './support.repository';
const URL = process.env.MIGRATOR_DATABASE_URL;
describe.skipIf(!URL)('support message keyword on clean isolated PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: URL, max: 1 }); });
  afterAll(async () => { await pool.end(); });
  it('enforces actor, literal keyword, first-200 boundary and negative direct ACL', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const owner = randomUUID(), outsider = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES($1),($2)', [owner, outsider]);
      const result = await client.query<{ id: string }>(
        `INSERT INTO public.support_threads(user_id,subject,create_key)
         VALUES($1,'test keyword', $2) RETURNING id::text`, [owner, randomUUID()]);
      const thread = result.rows[0]!.id;
      await client.query(`
        INSERT INTO public.support_messages(thread_id,sender_user_id,sender_kind,body,idempotency_key,created_at)
        SELECT $1,$2,'user',CASE WHEN n >= 200 THEN '환불 %_ 확인' ELSE '일반 내용' END,
               pg_catalog.gen_random_uuid(), '2026-10-30T00:00:00Z'::timestamptz + n * interval '1 second'
        FROM generate_series(1,201) n`, [thread, owner]);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repo = new SupportRepository(client);
      const matching = await repo.messages(owner, thread, 200, '%_ 확인');
      expect(matching).toHaveLength(1);
      expect(matching[0]!.body).toBe('환불 %_ 확인');
      expect(await repo.messages(owner, thread, 200, 'does not exist')).toEqual([]);
      await client.query('SAVEPOINT outsider');
      const denied = await rejectionOf(() => repo.messages(outsider, thread, 200, '환불'));
      expect((denied as { code?: string }).code).toBe('42501');
      await client.query('ROLLBACK TO SAVEPOINT outsider');
      await client.query('SAVEPOINT table_acl');
      const direct = await rejectionOf(() => client.query('SELECT * FROM public.support_messages'));
      expect((direct as { code?: string }).code).toBe('42501');
      await client.query('ROLLBACK TO SAVEPOINT table_acl');
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
