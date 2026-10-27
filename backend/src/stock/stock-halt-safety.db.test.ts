import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { databaseUrl } from '../testing/database';
import { PostgresStockRepository } from './stock.repository';

const url = databaseUrl();
const pool = url ? new Pool({ connectionString: url, max: 1 }) : null;
const ACTOR = '11111111-1111-4111-8111-111111111111';
const STOCK = '22222222-2222-4222-8222-222222222222';

afterAll(async () => { await pool?.end(); });

describe.skipIf(!pool)('stock halt hold against isolated real PostgreSQL', () => {
  it('preserves the least-privilege app boundary and refuses both mutations', async () => {
    const db = pool!;
    const evidence = await db.query<{
      role_name: string;
      ledger_insert: boolean;
      treasury_update: boolean;
    }>(`SELECT current_user AS role_name,
      has_table_privilege(current_user, 'public.ledger_postings', 'INSERT') AS ledger_insert,
      has_table_privilege(current_user, 'public.system_treasury_vaults', 'UPDATE') AS treasury_update`);
    expect(evidence.rows[0]?.role_name).toBe('moneyverse_app');
    expect(evidence.rows[0]?.ledger_insert).toBe(false);
    expect(evidence.rows[0]?.treasury_update).toBe(false);

    const repo = new PostgresStockRepository(db);
    await expect(repo.halt(ACTOR, STOCK)).rejects.toMatchObject({ status: 503 });
    await expect(repo.halt(ACTOR, STOCK, '33333333-3333-4333-8333-333333333333'))
      .rejects.toMatchObject({ status: 503 });
  });
});
