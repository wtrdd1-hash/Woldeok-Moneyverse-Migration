import type { Queryable } from './db';

interface TransactionClient extends Queryable {
  release(): void;
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
        // Preserve the original failure; the connection is released below.
      }
    }
    throw error;
  } finally {
    client.release();
  }
}
