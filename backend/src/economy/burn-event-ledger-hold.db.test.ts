import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';

const url = databaseUrl();

describe.skipIf(!url)('P0 burn draw least-privilege SQL boundary on real PostgreSQL', () => {
  let app: Pool;
  beforeAll(() => { app = new Pool({ connectionString: url, max: 1 }); });
  afterAll(async () => { await app.end(); });

  it('revokes direct application execution of the unledgered burn function', async () => {
    const result = await app.query<{ executable: boolean }>(`
      SELECT pg_catalog.has_function_privilege(
        current_user, 'public.participate_anti_inflation_burn_draw(uuid,numeric)', 'EXECUTE'
      ) AS executable
    `);
    expect(result.rows[0]?.executable).toBe(false);
    await expect(app.query(
      'SELECT public.participate_anti_inflation_burn_draw($1::uuid, $2::numeric)',
      ['11111111-1111-4111-8111-111111111111', '10000'],
    )).rejects.toMatchObject({ code: '42501' });
  });
});
