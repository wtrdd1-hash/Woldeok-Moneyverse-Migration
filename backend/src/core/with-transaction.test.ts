import { describe, expect, it, vi } from 'vitest';
import { withPgTransaction } from './with-transaction';

function fakePool(throwOnWrite = false) {
  const log: string[] = [];
  const client = {
    query: vi.fn(async (sql: string) => {
      log.push(sql);
      if (throwOnWrite && sql === 'WRITE') throw new Error('injected mid-write failure');
      return { rows: [] };
    }),
    release: vi.fn(),
  };
  const pool = { query: vi.fn(async () => { throw new Error('out-of-transaction pool query'); }), connect: vi.fn(async () => client) };
  return { log, client, pool };
}
describe('atomic financial write unit', () => {
  it('uses one client for all writes and commits once', async () => {
    const { log, client, pool } = fakePool();
    await withPgTransaction(pool, async db => { await db.query('WRITE'); await db.query('WRITE'); });
    expect(log).toEqual(['BEGIN', 'WRITE', 'WRITE', 'COMMIT']);
    expect(pool.query).not.toHaveBeenCalled();
    expect(client.release).toHaveBeenCalledOnce();
  });
  it('rolls back on any failed operation and releases client', async () => {
    const { log, client, pool } = fakePool(true);
    await expect(withPgTransaction(pool, db => db.query('WRITE'))).rejects.toThrow('injected');
    expect(log).toEqual(['BEGIN', 'WRITE', 'ROLLBACK']);
    expect(client.release).toHaveBeenCalledOnce();
  });
  it('destroys the borrowed connection if ROLLBACK itself fails', async () => {
    const original = new Error('financial operation failed');
    const client = {
      query: vi.fn(async (sql: string) => {
        if (sql === 'WRITE') throw original;
        if (sql === 'ROLLBACK') throw new Error('connection lost during rollback');
        return { rows: [] };
      }),
      release: vi.fn(),
    };
    const pool = { query: vi.fn(), connect: vi.fn(async () => client) };
    await expect(withPgTransaction(pool, async (db) => db.query('WRITE'))).rejects.toBe(original);
    expect(client.query.mock.calls.map(([sql]) => sql)).toEqual(['BEGIN', 'WRITE', 'ROLLBACK']);
    expect(client.release).toHaveBeenCalledWith(true);
  });

  it('destroys a connection when BEGIN fails before the transaction starts', async () => {
    const client = {
      query: vi.fn(async () => { throw new Error('connection failed to begin'); }),
      release: vi.fn(),
    };
    const pool = { query: vi.fn(), connect: vi.fn(async () => client) };
    await expect(withPgTransaction(pool, async () => 'unsafe')).rejects.toThrow('connection failed to begin');
    expect(client.release).toHaveBeenCalledWith(true);
  });
  it('fails closed when a pooled client is unavailable', async () => {
    await expect(withPgTransaction({ query: async () => ({ rows: [] }) }, async () => 'unsafe')).rejects.toThrow('transaction-capable');
  });
});
