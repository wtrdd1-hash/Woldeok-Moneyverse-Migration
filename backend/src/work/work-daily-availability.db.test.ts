import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { WorkRepository } from './work.repository';

const url = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!url)('daily task availability on isolated PostgreSQL', () => {
  it('uses the member-scoped read function, respects unlimited quotas, and retains least privilege', async () => {
    const pool = new Pool({ connectionString: url, max: 1 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const actor = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES ($1)', [actor]);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repo = new WorkRepository(client);
      const all = await repo.tasks(actor);
      const available = await repo.tasks(actor, undefined, undefined, true);
      expect(all.length).toBeGreaterThan(0);
      expect(available.map((task) => task.task_id)).toEqual(
        all
          .filter((task) => task.daily_limit <= 0 || task.taken_today < task.daily_limit)
          .map((task) => task.task_id),
      );
      const acl = await client.query<{ allowed: boolean }>(
        "SELECT has_table_privilege(current_user, 'public.work_task_catalog', 'SELECT') AS allowed",
      );
      expect(acl.rows[0]?.allowed).toBe(false);
    } finally {
      await client.query('ROLLBACK');
      client.release();
      await pool.end();
    }
  });
});
