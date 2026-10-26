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
  it('fails closed when a pooled client is unavailable', async () => {
    await expect(withPgTransaction({ query: async () => ({ rows: [] }) }, async () => 'unsafe')).rejects.toThrow('transaction-capable');
  });
  it('discards the pooled connection when BEGIN fails before work runs', async () => {
    const { log, client, pool } = fakePool();
    const beginError = new Error('connection lost on BEGIN');
    client.query.mockImplementation(async (sql: string) => {
      log.push(sql);
      if (sql === 'BEGIN') throw beginError;
      return { rows: [] };
    });
    const work = vi.fn(async () => 'should not run');
    await expect(withPgTransaction(pool, work)).rejects.toBe(beginError);
    expect(work).not.toHaveBeenCalled();
    expect(log).toEqual(['BEGIN']);
    expect(client.release).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('discards the pooled connection after a failed ROLLBACK, retaining the original write error', async () => {
    const { log, client, pool } = fakePool();
    const writeError = new Error('failed ledger write');
    client.query.mockImplementation(async (sql: string) => {
      log.push(sql);
      if (sql === 'WRITE') throw writeError;
      if (sql === 'ROLLBACK') throw new Error('connection lost during rollback');
      return { rows: [] };
    });
    await expect(withPgTransaction(pool, db => db.query('WRITE'))).rejects.toBe(writeError);
    expect(log).toEqual(['BEGIN', 'WRITE', 'ROLLBACK']);
    expect(client.release).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('returns a healthy pooled connection after successful rollback', async () => {
    const { client, pool } = fakePool(true);
    await expect(withPgTransaction(pool, db => db.query('WRITE'))).rejects.toThrow('injected');
    expect(client.release).toHaveBeenCalledOnce();
    expect(client.release).toHaveBeenCalledWith();
  });

  it('discards the pooled connection when COMMIT and subsequent ROLLBACK both fail', async () => {
    const { log, client, pool } = fakePool();
    const commitError = new Error('commit outcome unknown');
    client.query.mockImplementation(async (sql: string) => {
      log.push(sql);
      if (sql === 'COMMIT') throw commitError;
      if (sql === 'ROLLBACK') throw new Error('rollback unavailable');
      return { rows: [] };
    });
    await expect(withPgTransaction(pool, async db => db.query('WRITE'))).rejects.toBe(commitError);
    expect(log).toEqual(['BEGIN', 'WRITE', 'COMMIT', 'ROLLBACK']);
    expect(client.release).toHaveBeenCalledExactlyOnceWith(true);
  });
  it('discards a connection when COMMIT fails even if ROLLBACK reports success', async () => {
    const { log, client, pool } = fakePool();
    const commitError = new Error('commit acknowledgement lost');
    client.query.mockImplementation(async (sql: string) => {
      log.push(sql);
      if (sql === 'COMMIT') throw commitError;
      return { rows: [] };
    });
    await expect(withPgTransaction(pool, async db => db.query('WRITE'))).rejects.toBe(commitError);
    expect(log).toEqual(['BEGIN', 'WRITE', 'COMMIT', 'ROLLBACK']);
    expect(client.release).toHaveBeenCalledExactlyOnceWith(true);
  });
});
