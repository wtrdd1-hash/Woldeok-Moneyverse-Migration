import type { Queryable } from './db';

interface TransactionClient extends Queryable {
  release(destroy?: boolean): void;
}
interface TransactionPool extends Queryable {
  connect(): Promise<TransactionClient>;
}

/**
 * All writes and SELECT FOR UPDATE statements must go through the same
 * connection. A Queryable without connect() fails closed instead of silently
 * issuing independent auto-committed financial statements.
 */
export async function withPgTransaction<T>(
  db: Queryable,
  work: (client: Queryable) => Promise<T>,
): Promise<T> {
  if (typeof (db as Partial<TransactionPool>).connect !== 'function') {
    throw new Error('transaction-capable database pool is required for financial settlement');
  }
  const pool = db as TransactionPool;
  const client = await pool.connect();
  let began = false;
  let destroyClient = false;
  try {
    await client.query('BEGIN');
    began = true;
    const value = await work(client);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    if (began) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Rollback failed: the transaction state is unknown. Never return
        // this client to the pool for another financial operation.
        destroyClient = true;
      }
    } else {
      // BEGIN failed; a broken/uncertain connection must not be reused.
      destroyClient = true;
    }
    throw error;
  } finally {
    client.release(destroyClient);
  }
}
