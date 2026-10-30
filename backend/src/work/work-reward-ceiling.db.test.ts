import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { WorkRepository } from './work.repository';

const url = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!url)('work reward ceiling on isolated real PostgreSQL', () => {
  it('compares preview rewards as numeric inside member-scoped SECDEF and preserves app ACL', async () => {
    const pool = new Pool({ connectionString: url, max: 1 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const actor = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES ($1)', [actor]);
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repository = new WorkRepository(client);
      const all = await repository.tasks(actor);
      const ceiling = '9007199254740993';
      const filtered = await repository.tasks(actor, undefined, undefined, ceiling);
      const eligible = all.filter((task) => task.reward_preview !== null && BigInt(task.reward_preview) <= BigInt(ceiling));
      expect(all.length).toBeGreaterThan(0);
      expect(filtered.map((task) => task.task_id)).toEqual(eligible.map((task) => task.task_id));
      const exactZero = await repository.tasks(actor, undefined, undefined, '0');
      expect(exactZero.every((task) => task.reward_preview !== null && BigInt(task.reward_preview) === 0n)).toBe(true);
      const combined = await repository.tasks(actor, '1', 300, ceiling);
      expect(combined.every((task) => task.reward_preview !== null && BigInt(task.reward_preview) >= 1n && BigInt(task.reward_preview) <= BigInt(ceiling) && task.minimum_duration_seconds <= 300)).toBe(true);
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
