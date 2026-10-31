import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { WorkRepository } from './work.repository';

const url = process.env.MIGRATOR_DATABASE_URL;
describe.skipIf(!url)('member EXP floor against isolated PostgreSQL', () => {
  it('matches actor-scoped preview and denies direct catalogue reads, then rolls back', async () => {
    const pool = new Pool({ connectionString: url, max: 1 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const actor = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES ($1)', [actor]);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repository = new WorkRepository(client);
      const all = await repository.tasks(actor);
      const filtered = await repository.tasks(actor, undefined, undefined, undefined, '50');
      expect(all.length).toBeGreaterThan(0);
      expect(filtered.map((row) => row.task_id)).toEqual(all.filter((row) => row.experience_preview !== null && BigInt(row.experience_preview) >= 50n).map((row) => row.task_id));
      expect((await client.query(`SELECT has_table_privilege(current_user, 'public.work_task_catalog', 'SELECT') AS allowed`)).rows[0]?.allowed).toBe(false);
    } finally {
      await client.query('ROLLBACK');
      client.release();
      await pool.end();
    }
  });
});
