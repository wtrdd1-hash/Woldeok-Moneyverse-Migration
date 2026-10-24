import { describe, expect, it } from 'vitest';
import { Client } from 'pg';
import { PostgresWalletRepository } from './wallet.repository';

describe('wallet filter read-only PostgreSQL integration', () => {
  it.skipIf(process.env.MV_REAL_PG !== '1')('executes combined filters as moneyverse_app against isolated dev DB', async () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
    const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
    await client.connect();
    try {
      const db = await client.query<{ current_database: string }>('SELECT current_database()');
      expect(db.rows[0]?.current_database).toBe('woldeok_moneyverse_dev');
      await client.query('BEGIN READ ONLY');
      await client.query('SET LOCAL ROLE moneyverse_app');
      const owners = await client.query<{ owner_user_id: string }>(`
        SELECT a.owner_user_id::text AS owner_user_id FROM public.accounts a
        JOIN public.ledger_postings p ON p.account_id=a.id
        WHERE a.owner_user_id IS NOT NULL AND a.account_type IN ('USER_CASH','USER_BANK')
        GROUP BY a.owner_user_id ORDER BY COUNT(*) DESC LIMIT 2`);
      expect(owners.rows.length).toBeGreaterThan(0);
      const repo = new PostgresWalletRepository(client);
      for (const { owner_user_id: owner } of owners.rows) {
        const since = new Date('2026-07-26T00:00:00Z');
        const rows = await repo.recentTransactionsForUser(owner, 50, { direction: 'in', category: 'reward', since });
        expect(rows.length).toBeLessThanOrEqual(50);
        for (const row of rows) {
          expect(['MINT_TO_USER','WORK_REWARD','WORK_TASK_REWARD','EARLY_EVENT_REWARD','TREASURY_TO_USER']).toContain(row.type);
          expect(BigInt(row.net_amount)).toBeGreaterThan(0n);
          expect(new Date(row.created_at).getTime()).toBeGreaterThanOrEqual(since.getTime());
          const owned = await client.query<{ owned: boolean }>(`
            SELECT EXISTS (SELECT 1 FROM public.ledger_postings p JOIN public.accounts a ON a.id=p.account_id
              WHERE p.transaction_id=$1 AND a.owner_user_id=$2 AND a.account_type IN ('USER_CASH','USER_BANK')) AS owned`,
          [row.transaction_id, owner]);
          expect(owned.rows[0]?.owned).toBe(true);
        }
      }
    } finally {
      await client.query('ROLLBACK').catch(() => undefined);
      await client.end();
    }
  });
});
