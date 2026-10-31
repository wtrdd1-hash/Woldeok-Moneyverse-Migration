import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { rejectionOf } from '../testing/database';
import { SupportRepository } from './support.repository';
import { parseSupportKstRange } from './support-date-range';

const url = process.env.MIGRATOR_DATABASE_URL;
describe.skipIf(!url)('KST support date window on isolated PostgreSQL 17', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: url, max: 1 }); });
  afterAll(async () => { await pool.end(); });
  it('filters recent owner rows at both KST boundaries, rejects foreign rows and raw SELECT', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const actor = randomUUID(); const stranger = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES ($1),($2)', [actor, stranger]);
      const rows = [
        [actor, 'before', '2026-10-29T14:59:59.999Z'],
        [actor, 'first', '2026-10-29T15:00:00.000Z'],
        [actor, 'last', '2026-10-31T14:59:59.999Z'],
        [actor, 'after', '2026-10-31T15:00:00.000Z'],
        [stranger, 'foreign', '2026-10-30T00:00:00.000Z'],
      ] as const;
      for (const [user, subject, time] of rows) {
        await client.query('INSERT INTO public.support_threads(user_id,subject,create_key,last_message_at) VALUES ($1,$2,$3,$4)',
          [user, subject, randomUUID(), time]);
      }
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repo = new SupportRepository(client);
      const range = parseSupportKstRange('2026-10-30', '2026-10-31');
      expect((await repo.myThreads(actor, null, undefined, undefined, range)).map(t => t.subject)).toEqual(['last', 'first']);
      expect((await repo.myThreads(actor, null, undefined, 'oldest', range)).map(t => t.subject)).toEqual(['first', 'last']);
      expect(await repo.myThreads(stranger, null, 'first', undefined, range)).toEqual([]);
      await client.query('SAVEPOINT deny_raw');
      const error = await rejectionOf(() => client.query('SELECT * FROM public.support_threads'));
      expect((error as { code?: string }).code).toBe('42501');
      await client.query('ROLLBACK TO SAVEPOINT deny_raw');
    } finally { await client.query('ROLLBACK'); client.release(); }
  });
});
