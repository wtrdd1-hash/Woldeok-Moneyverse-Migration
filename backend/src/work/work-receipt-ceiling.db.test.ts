import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { WorkRepository } from './work.repository';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

/** Run only against an explicitly supplied isolated scratch database. Never production. */
describe.skipIf(!MIGRATOR_DATABASE_URL)('work receipt ceiling on real PostgreSQL', () => {
  it('preserves owner scope, exact bigint comparison and negative table ACL, then rolls back', async () => {
    const pool = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    const client = await pool.connect();
    const owner = randomUUID();
    const foreign = randomUUID();
    const taskCode = `receipt_ceiling_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO public.users(id) VALUES ($1),($2)', [owner, foreign]);
      const task = await client.query<{ id: string }>(
        `INSERT INTO public.work_task_catalog
          (code,name,description,job_type,difficulty,base_reward,base_experience,minimum_duration_seconds,daily_limit)
         VALUES ($1,'Synthetic work','Isolated test only','farmer',1,100,1,60,10) RETURNING id`,
        [taskCode],
      );
      const taskId = task.rows[0]!.id;
      const amounts = [
        { actor: owner, reward: '9007199254740993' },
        { actor: owner, reward: '10' },
        { actor: foreign, reward: '5' },
      ];
      for (const item of amounts) {
        const assignmentId = randomUUID();
        await client.query(
          `INSERT INTO public.work_assignments(id,user_id,task_id,expires_at)
           VALUES ($1,$2,$3,clock_timestamp() + interval '1 day')`,
          [assignmentId, item.actor, taskId],
        );
        await client.query(
          `INSERT INTO public.work_reward_receipts
           (idempotency_key,user_id,assignment_id,reward_amount,experience_amount)
           VALUES ($1,$2,$3,$4::bigint,1)`,
          [randomUUID(), item.actor, assignmentId, item.reward],
        );
      }
      const acl = await client.query<{ direct: boolean; executable: boolean }>(
        `SELECT has_table_privilege('moneyverse_app','public.work_reward_receipts','SELECT') AS direct,
                has_function_privilege('moneyverse_app','public.work_my_receipts(uuid)','EXECUTE') AS executable`,
      );
      expect(acl.rows[0]).toEqual({ direct: false, executable: true });
      await client.query('SET LOCAL ROLE moneyverse_app');
      const repository = new WorkRepository(client);
      const limited = await repository.receipts(owner, '9007199254740992');
      expect(limited.map((receipt) => receipt.reward_amount)).toEqual(['10']);
      const exact = await repository.receipts(owner, '9007199254740993');
      expect(exact.map((receipt) => receipt.reward_amount)).toContain('9007199254740993');
      expect(exact).toHaveLength(2);
      const other = await repository.receipts(foreign, '9007199254740993');
      expect(other.map((receipt) => receipt.reward_amount)).toEqual(['5']);
    } finally {
      await client.query('ROLLBACK');
      client.release();
      await pool.end();
    }
  });
});
