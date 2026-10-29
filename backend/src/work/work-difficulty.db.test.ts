import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WorkRepository } from './work.repository';

const DATABASE_URL = process.env.WORK_DIFFICULTY_TEST_DATABASE_URL;
const ACTOR = '00000000-0000-4000-8000-000000000001';

describe.skipIf(!DATABASE_URL)('work difficulty against isolated PostgreSQL synthetic role', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: DATABASE_URL, max: 1 }); });
  afterAll(async () => { await pool?.end(); });

  it('returns only the caller’s difficulty-four task and keeps 64-bit reward strings intact', async () => {
    const rows = await new WorkRepository(pool).tasks(ACTOR, 4);
    expect(rows.map((row) => row.code)).toEqual(['farmer_hard']);
    expect(rows[0]?.base_reward).toBe('9007199254740993');
    expect(rows[0]?.reward_preview).toBe('9007199254740993');
  });

  it('keeps the original full owner-scoped board when no difficulty is supplied', async () => {
    const rows = await new WorkRepository(pool).tasks(ACTOR);
    expect(rows.map((row) => row.code).sort()).toEqual(['farmer_easy', 'farmer_hard']);
  });

  it('does not reveal the same difficulty for a different member', async () => {
    const rows = await new WorkRepository(pool).tasks('00000000-0000-4000-8000-000000000002', 4);
    expect(rows.map((row) => row.code)).toEqual(['other_hard']);
  });

  it('denies the application role direct table access', async () => {
    await expect(pool.query('SELECT * FROM public.work_task_catalog')).rejects.toMatchObject({ code: '42501' });
    await expect(pool.query('DELETE FROM public.work_task_catalog')).rejects.toMatchObject({ code: '42501' });
  });
});
