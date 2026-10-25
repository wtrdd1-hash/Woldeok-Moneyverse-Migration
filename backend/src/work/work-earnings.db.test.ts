import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl } from '../testing/database';
import { WorkRepository } from './work.repository';

const DATABASE_URL = databaseUrl();

describe.skipIf(!DATABASE_URL)('verified work earnings on isolated PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: DATABASE_URL, max: 1 }); });
  afterAll(async () => { await pool.end(); });

  it('returns an empty but authoritative window for an absent actor without any writes', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN READ ONLY');
      const result = await new WorkRepository(client).verifiedEarnings(randomUUID());
      expect(result).toMatchObject({ window: 'RECENT_20', limit: 20, verified_wld: '0', receipts: [] });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('does not grant the application direct work receipt inserts or ledger posting updates', async () => {
    const { rows } = await pool.query<{ can_insert: boolean; can_update: boolean }>(
      `SELECT has_table_privilege('moneyverse_app', 'public.work_reward_receipts', 'INSERT') AS can_insert,
              has_table_privilege('moneyverse_app', 'public.ledger_postings', 'UPDATE') AS can_update`,
    );
    expect(rows[0]).toMatchObject({ can_insert: false, can_update: false });
  });
});
