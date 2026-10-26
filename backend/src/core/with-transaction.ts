import type { Queryable } from './db';

interface TransactionClient extends Queryable {
  release(error?: Error | boolean): void;
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
  let committing = false;
  let discardClient = false;
  try {
    await client.query('BEGIN');
    began = true;
    const value = await work(client);
    committing = true;
    await client.query('COMMIT');
    return value;
  } catch (error) {
    // A failed BEGIN may leave the connection unusable. A failed COMMIT may
    // have an unknown outcome even if a later ROLLBACK appears to succeed.
    // Neither connection can safely be returned to the shared pool.
    if (!began || committing) discardClient = true;
    if (began) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // A failed ROLLBACK leaves transaction state unknown. Preserve the
        // original error, but evict this client rather than reuse it.
        discardClient = true;
      }
    }
    throw error;
  } finally {
    // pg PoolClient.release(true) removes a potentially poisoned connection.
    // Healthy clients are returned without an error for normal pool reuse.
    if (discardClient) client.release(true);
    else client.release();
  }
}
