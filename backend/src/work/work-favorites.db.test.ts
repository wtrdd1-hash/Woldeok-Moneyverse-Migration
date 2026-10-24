import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!databaseUrl() || !MIGRATOR_DATABASE_URL)('work favorites real PostgreSQL owner and ACL regression', () => {
  it('enforces owner isolation, idempotent state, and rollback without app table DML', async () => {
    const pool = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const owner = randomUUID();
      const other = randomUUID();
      await client.query('INSERT INTO public.users(id) VALUES ($1), ($2)', [owner, other]);
      const tasks = await client.query<{ id: string }>(
        'SELECT id::text FROM public.work_task_catalog WHERE active ORDER BY id LIMIT 1',
      );
      expect(tasks.rows.length).toBeGreaterThan(0);
      const task = tasks.rows[0]!.id;
      const acl = await client.query<{ can_insert: boolean; can_select: boolean; can_execute: boolean }>(
        `SELECT has_table_privilege('moneyverse_app', 'public.work_task_favorites', 'INSERT') AS can_insert,
                has_table_privilege('moneyverse_app', 'public.work_task_favorites', 'SELECT') AS can_select,
                has_function_privilege('moneyverse_app', 'public.work_favorite_set(uuid,uuid,boolean)', 'EXECUTE') AS can_execute`,
      );
      expect(acl.rows[0]).toMatchObject({ can_insert: false, can_select: false, can_execute: true });
      await client.query('SET LOCAL ROLE moneyverse_app');
      const save = async (actor: string, saved: boolean) => {
        const result = await client.query<{ saved: boolean; replayed: boolean }>(
          'SELECT saved, replayed FROM public.work_favorite_set($1,$2,$3)',
          [actor, task, saved],
        );
        return result.rows[0];
      };
      expect(await save(owner, true)).toEqual({ saved: true, replayed: false });
      expect(await save(owner, true)).toEqual({ saved: true, replayed: true });
      const mine = await client.query('SELECT task_id FROM public.work_favorites_list($1)', [owner]);
      const theirs = await client.query('SELECT task_id FROM public.work_favorites_list($1)', [other]);
      expect(mine.rows).toHaveLength(1);
      expect(theirs.rows).toHaveLength(0);
      expect(await save(owner, false)).toEqual({ saved: false, replayed: false });
      expect(await save(owner, false)).toEqual({ saved: false, replayed: true });
    } finally {
      await client.query('ROLLBACK');
      client.release();
      await pool.end();
    }
  });
});
