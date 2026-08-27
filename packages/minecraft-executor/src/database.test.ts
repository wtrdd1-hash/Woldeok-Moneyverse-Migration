import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  assertAllowedExecutorQuery,
  createRoleScopedExecutorPool,
  MinecraftExecutorDatabaseError,
} from './database';

const CLAIM_SQL = `SELECT operation_id::text AS operation_id
  FROM public.minecraft_claim_next_approved_operation($1, $2)`;

interface RecordedCall {
  readonly sql: string;
  readonly values?: readonly unknown[] | undefined;
}

function fakeRawPool({ failAt = null }: { failAt?: string | null } = {}) {
  const calls: RecordedCall[] = [];
  const client = {
    async query(sql: string, values?: readonly unknown[]): Promise<unknown> {
      calls.push({ sql, values });
      if (sql === failAt) throw new Error('database topology and credentials must not escape');
      return { rows: [] };
    },
    release(): void { calls.push({ sql: 'RELEASE' }); },
  };
  return {
    calls,
    pool: { async connect() { return client; } },
  };
}

test('role-scoped pool accepts only the two executor DB functions and uses SET LOCAL ROLE per query', async () => {
  const fake = fakeRawPool();
  const pool = createRoleScopedExecutorPool(fake.pool);
  const result = await pool.query(CLAIM_SQL, ['10000000-0000-4000-8000-000000000001', 30]);
  assert.deepEqual(result, { rows: [] });
  assert.deepEqual(fake.calls.map(({ sql }) => sql), [
    'BEGIN',
    'SET LOCAL ROLE moneyverse_minecraft_executor',
    CLAIM_SQL,
    'COMMIT',
    'RELEASE',
  ]);
});

test('query guard rejects direct table access, DML, multi-statements, and non-executor functions before connecting', () => {
  for (const sql of [
    'SELECT * FROM public.minecraft_approved_operations',
    'SELECT * FROM public.minecraft_claim_next_approved_operation($1, $2) CROSS JOIN public.users',
    'INSERT INTO public.minecraft_approved_operations DEFAULT VALUES',
    'SELECT * FROM public.minecraft_request_approved_operation($1, $2, $3)',
    'SELECT * FROM public.minecraft_claim_next_approved_operation($1, $2); SELECT 1',
  ]) {
    assert.throws(() => assertAllowedExecutorQuery(sql), MinecraftExecutorDatabaseError);
  }
});

test('role-scoped pool rolls back and releases on SET ROLE or DB failures', async () => {
  const fake = fakeRawPool({ failAt: CLAIM_SQL });
  const pool = createRoleScopedExecutorPool(fake.pool);
  await assert.rejects(pool.query(CLAIM_SQL, []), /database topology/);
  assert.deepEqual(fake.calls.map(({ sql }) => sql), [
    'BEGIN',
    'SET LOCAL ROLE moneyverse_minecraft_executor',
    CLAIM_SQL,
    'ROLLBACK',
    'RELEASE',
  ]);
});
