import { MINECRAFT_EXECUTOR_ROLE } from './config';

const ALLOWED_FUNCTIONS = new Set([
  'minecraft_claim_next_approved_operation',
  'minecraft_complete_approved_operation',
]);

export class MinecraftExecutorDatabaseError extends Error {
  constructor(message = 'Minecraft executor database operation failed') {
    super(message);
    this.name = 'MinecraftExecutorDatabaseError';
  }
}

/** The minimal shape this module needs from a pg `Pool` or `PoolClient`. */
export interface ExecutorPoolClient {
  query(sql: string, values?: readonly unknown[]): Promise<unknown>;
  release(): void;
}

export interface ExecutorRawPool {
  connect(): Promise<ExecutorPoolClient>;
}

export interface ExecutorScopedPool {
  query(sql: string, values?: readonly unknown[]): Promise<unknown>;
}

function requirePool(pool: unknown): ExecutorRawPool {
  if (!pool || typeof (pool as { connect?: unknown }).connect !== 'function') {
    throw new TypeError('a PostgreSQL pool with connect() is required');
  }
  return pool as ExecutorRawPool;
}

/**
 * The repository normally constructs these SELECT statements. Defend the
 * adapter too, so a future caller cannot quietly turn this privileged pool
 * into a general SQL connection.
 */
export function assertAllowedExecutorQuery(sql: unknown): asserts sql is string {
  if (typeof sql !== 'string' || !/^\s*SELECT\b/i.test(sql) || sql.includes(';')) {
    throw new MinecraftExecutorDatabaseError('Minecraft executor may call only fixed operation functions');
  }
  const functionMatches = [...sql.matchAll(/\bpublic\.([a-z_][a-z0-9_]*)\s*\(/gi)];
  const publicReferences = [...sql.matchAll(/\bpublic\.([a-z_][a-z0-9_]*)\b/gi)];
  const functionName = functionMatches.length === 1 ? functionMatches[0]?.[1]?.toLowerCase() : undefined;
  const referenceName = publicReferences.length === 1 ? publicReferences[0]?.[1]?.toLowerCase() : undefined;
  if (functionName === undefined
    || referenceName === undefined
    || !ALLOWED_FUNCTIONS.has(functionName)
    || !ALLOWED_FUNCTIONS.has(referenceName)) {
    throw new MinecraftExecutorDatabaseError('Minecraft executor may call only fixed operation functions');
  }
}

/**
 * Returns the minimal pool-shaped object accepted by
 * PostgresMinecraftApprovedOperationExecutorRepository. Every call starts a
 * short transaction and assumes the fixed NOLOGIN group role. The configured
 * login principal must be NOINHERIT and a member of that role; a failure to
 * assume it aborts before the DB function is called.
 */
export function createRoleScopedExecutorPool(pool: unknown): ExecutorScopedPool {
  const rawPool = requirePool(pool);

  return Object.freeze({
    async query(sql: unknown, values?: readonly unknown[]): Promise<unknown> {
      assertAllowedExecutorQuery(sql);
      const client = await rawPool.connect();
      let transactionStarted = false;
      try {
        await client.query('BEGIN');
        transactionStarted = true;
        // This is a static statement, not a configured string. See migration
        // 017 and config.js for why the role identifier is intentionally fixed.
        await client.query(`SET LOCAL ROLE ${MINECRAFT_EXECUTOR_ROLE}`);
        const result = await client.query(sql, values);
        await client.query('COMMIT');
        transactionStarted = false;
        return result;
      } catch (error) {
        if (transactionStarted) {
          try {
            await client.query('ROLLBACK');
          } catch {
            // The original failure is intentionally retained for the worker to
            // map to a generic, non-sensitive operational event.
          }
        }
        throw error;
      } finally {
        client.release();
      }
    },
  });
}

export const __test__ = { ALLOWED_FUNCTIONS };
