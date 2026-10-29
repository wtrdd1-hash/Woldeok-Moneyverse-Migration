import { describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresWalletRepository } from './wallet.repository';

const URL = process.env.MV_A0503_TEST_DATABASE_URL;
const OWNER = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '22222222-2222-4222-8222-222222222222';

// Only an explicitly configured disposable, isolated PostgreSQL fixture may run this test.
describe.skipIf(!URL)('owner wallet direction isolated PostgreSQL proof', () => {
  it('filters 70 mixed owner entries before limit, retains exact WLD strings and hides foreign entries', async () => {
    const pool = new Pool({ connectionString: URL, connectionTimeoutMillis: 3000 });
    try {
      const repo = new PostgresWalletRepository(pool);
      const asOf = new Date('2026-10-28T00:00:00Z');
      const all = await repo.activityTransactionsForUser(OWNER, { asOf, since: null, direction: 'all' });
      expect(all).toHaveLength(51);
      const last = all[49]!;
      const second = await repo.activityTransactionsForUser(OWNER, { asOf, since: null, direction: 'all', after: { at: last.created_at, id: last.transaction_id } });
      expect(second).toHaveLength(20);
      expect(new Set([...all.slice(0, 50), ...second].map((r) => r.transaction_id)).size).toBe(70);
      const incoming = await repo.activityTransactionsForUser(OWNER, { asOf, since: null, direction: 'in' });
      const outgoing = await repo.activityTransactionsForUser(OWNER, { asOf, since: null, direction: 'out' });
      const neutral = await repo.activityTransactionsForUser(OWNER, { asOf, since: null, direction: 'neutral' });
      expect([incoming.length, outgoing.length, neutral.length]).toEqual([24, 23, 23]);
      expect(incoming.every((r) => r.net_amount === '9007199254740993')).toBe(true);
      expect(outgoing.every((r) => r.net_amount === '-9007199254740993')).toBe(true);
      expect(neutral.every((r) => r.net_amount === '0' && r.cash_delta === '9007199254740993' && r.bank_delta === '-9007199254740993')).toBe(true);
      expect(await repo.activityTransactionsForUser(FOREIGN, { asOf, since: null, direction: 'out' })).toHaveLength(1);
      const rights = await pool.query("SELECT has_table_privilege(current_user, 'public.ledger_transactions', 'INSERT') AS can_insert, has_table_privilege(current_user, 'public.ledger_postings', 'UPDATE') AS can_update");
      expect(rights.rows[0]).toMatchObject({ can_insert: false, can_update: false });
    } finally { await pool.end(); }
  });
});
