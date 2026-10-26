import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import type { QueryResultRow } from 'pg';
import { withPgTransaction } from './with-transaction';

// Explicitly isolated, throwaway PostgreSQL only. Never connect to a shared
// dev/Test/Production DB for a fault-injection transaction test.
const isolatedUrl = process.env.MONEYVERSE_ISOLATED_PG_URL;

describe.skipIf(!isolatedUrl)('transaction pool quarantine (isolated real PostgreSQL)', () => {
  const pool = new Pool({ connectionString: isolatedUrl, max: 1, connectionTimeoutMillis: 5_000 });
  afterAll(async () => { await pool.end(); });

  function adapter({ failRollback = false }: { failRollback?: boolean } = {}) {
    return {
      async query<R extends QueryResultRow>(sql: string, values?: readonly unknown[]) {
        return pool.query<R>(sql, values as unknown[] | undefined);
      },
      async connect() {
        const client = await pool.connect();
        return {
          async query<R extends QueryResultRow>(sql: string, values?: readonly unknown[]) {
            if (failRollback && sql === 'ROLLBACK') throw new Error('injected rollback transport failure');
            return client.query<R>(sql, values as unknown[] | undefined);
          },
          release(error?: Error | boolean) { client.release(error); },
        };
      },
    };
  }

  it('reuses the real PostgreSQL connection after a successful rollback', async () => {
    const failure = new Error('application write failure');
    await expect(withPgTransaction(adapter(), async db => {
      await db.query('SELECT pg_backend_pid()');
      throw failure;
    })).rejects.toBe(failure);
    expect(pool.totalCount).toBe(1);
    const result = await pool.query('SELECT 1 AS alive');
    expect(result.rows[0]?.alive).toBe(1);
  });

  it('evicts the real PostgreSQL connection when rollback cannot be confirmed', async () => {
    const failure = new Error('application write failure');
    await expect(withPgTransaction(adapter({ failRollback: true }), async db => {
      await db.query('SELECT pg_backend_pid()');
      throw failure;
    })).rejects.toBe(failure);
    expect(pool.totalCount).toBe(0);
    const result = await pool.query('SELECT 1 AS alive');
    expect(result.rows[0]?.alive).toBe(1);
  });
});
