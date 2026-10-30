import { describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresWalletRepository } from './wallet.repository';

const TEST_URL = process.env.MV_A1325_TEST_DATABASE_URL;
const ACTOR = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';

describe.skipIf(!TEST_URL)('wallet calendar range isolated PostgreSQL 17.11', () => {
  it('uses owner-scoped KST bounds and microsecond keyset without overlapping 72 microsecond-distinct rows', async () => {
    const pool = new Pool({ connectionString: TEST_URL, connectionTimeoutMillis: 2500 });
    try {
      const repo = new PostgresWalletRepository(pool);
      const options = {
        asOf: new Date('2026-10-30T04:00:00.000Z'),
        since: new Date('2026-10-27T15:00:00.000Z'),
        before: new Date('2026-10-30T15:00:00.000Z'),
        direction: 'in' as const,
      };
      const first = await repo.activityTransactionsForUser(ACTOR, options);
      expect(first).toHaveLength(51);
      expect(first[0]?.net_amount).toBe('9007199254740993');
      expect(first[0]?.cursor_at).toMatch(/^2026-10-29T00:00:00\.123457Z$/);
      const last = first[49]!;
      const second = await repo.activityTransactionsForUser(ACTOR, {
        ...options,
        after: { at: last.cursor_at!, id: last.transaction_id },
      });
      expect(second).toHaveLength(22);
      expect(
        new Set([...first.slice(0, 50), ...second].map((row) => row.transaction_id)).size,
      ).toBe(72);
      expect(await repo.activityTransactionsForUser(OTHER, options)).toHaveLength(1);
      expect(
        await repo.activityTransactionsForUser(ACTOR, {
          ...options,
          since: new Date('2026-10-29T15:00:00.000Z'),
        }),
      ).toHaveLength(0);
      const privilege = await pool.query(
        "SELECT has_table_privilege(current_user, 'public.ledger_transactions', 'INSERT') AS can_insert",
      );
      expect(privilege.rows[0]?.can_insert).toBe(false);
    } finally {
      await pool.end();
    }
  });
});
