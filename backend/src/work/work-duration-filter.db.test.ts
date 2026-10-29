import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { WorkRepository } from './work.repository';

const url = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!url)('work duration filter on isolated real PostgreSQL', () => {
  it('reads only through the member-scoped function with app role, and never grants catalogue access', async () => {
    const pool = new Pool({ connectionString: url, max: 1 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const actor = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES ($1)', [actor]);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repository = new WorkRepository(client);
      const all = await repository.tasks(actor);
      const filtered = await repository.tasks(actor, 60);
      expect(all.length).toBeGreaterThan(0);
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.length).toBeLessThan(all.length);
      expect(filtered.map((task) => task.task_id)).toEqual(
        all.filter((task) => task.minimum_duration_seconds <= 60).map((task) => task.task_id),
      );
      const acl = await client.query<{ allowed: boolean }>(
        `SELECT has_table_privilege(current_user, 'public.work_task_catalog', 'SELECT') AS allowed`,
      );
      expect(acl.rows[0]?.allowed).toBe(false);
    } finally {
      await client.query('ROLLBACK');
      client.release();
      await pool.end();
    }
  });
});
