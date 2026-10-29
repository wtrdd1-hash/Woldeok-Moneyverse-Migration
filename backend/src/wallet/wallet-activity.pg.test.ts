import { describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresWalletRepository } from './wallet.repository';

const TEST_URL = process.env.MV_A1457_TEST_DATABASE_URL;
const ACTOR = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';

// Explicitly isolated fixture URL only. Never run this test against a live DB.
describe.skipIf(!TEST_URL)('wallet history isolated PostgreSQL 17', () => {
  it('paginates 70 owner entries with timestamp ties, no overlap or foreign data and exact WLD strings', async () => {
    const pool = new Pool({ connectionString: TEST_URL, connectionTimeoutMillis: 2500 });
    try {
      const repo = new PostgresWalletRepository(pool);
      const asOf = new Date('2026-10-28T00:00:00Z');
      const first = await repo.activityTransactionsForUser(ACTOR, { asOf, since: null });
      expect(first).toHaveLength(51);
      expect(first[0]?.net_amount).toBe('900719925474099312345');
      const last = first[49]!;
      const second = await repo.activityTransactionsForUser(ACTOR, { asOf, since: null, after: { at: last.created_at, id: last.transaction_id } });
      expect(second).toHaveLength(20);
      expect(new Set([...first.slice(0, 50), ...second].map((entry) => entry.transaction_id)).size).toBe(70);
      const foreign = await repo.activityTransactionsForUser(OTHER, { asOf, since: null });
      expect(foreign).toHaveLength(1);
      expect(foreign[0]?.transaction_id).not.toBe(first[0]?.transaction_id);
      const outside = await repo.activityTransactionsForUser(ACTOR, { asOf, since: new Date('2026-10-28T00:00:00Z') });
      expect(outside).toHaveLength(0);
      const { rows } = await pool.query("SELECT has_table_privilege(current_user, 'ledger_transactions', 'INSERT') AS can_write");
      expect(rows[0]?.can_write).toBe(false);
    } finally { await pool.end(); }
  });
});
