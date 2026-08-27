import assert from 'node:assert/strict';
import type { QueryResultRow } from 'pg';
import type { Queryable, QueryResultLike } from '../db';

export interface RecordedQuery {
  sql: string;
  values: readonly unknown[];
}

/**
 * A `Queryable` double whose responses are consumed in order from a queue:
 * each entry is either a row array (the query "succeeds" with those rows) or
 * an `Error` (thrown, so a test can simulate a specific Postgres error via
 * `pgError`). Every repository in this codebase only ever reads `.rows` off
 * a query result — confirmed when `Queryable` was narrowed away from pg's
 * full `QueryResult` earlier in this conversion — so a plain row array is
 * everything a real caller needs.
 *
 * `query` must stay generic to satisfy `Queryable`'s generic method
 * signature; the cast from the queued `Record<string, unknown>[]` to `R[]`
 * is exactly the same "a runtime double cannot prove it matches a
 * compile-time generic" situation `Queryable`'s own doc comment describes,
 * and is logged in docs/superpowers/plans/as-casts.md.
 */
export function queueingPool(responses: readonly (readonly Record<string, unknown>[] | Error)[]) {
  const queue = [...responses];
  const calls: RecordedQuery[] = [];
  const pool: Queryable = {
    async query<R extends QueryResultRow>(sql: string, values: readonly unknown[] = []): Promise<QueryResultLike<R>> {
      calls.push({ sql, values });
      const response = queue.shift();
      if (response instanceof Error) throw response;
      if (!response) throw new Error('unexpected query');
      return { rows: response as R[] };
    },
  };
  return { calls, pool };
}

/**
 * A `Queryable` double that answers every query with the same fixed rows,
 * regardless of the SQL or values passed in. Used by tests that call several
 * repository methods against one canned result set and assert on the
 * recorded calls rather than on varying responses. Same generic-method cast
 * rationale as `queueingPool` above.
 */
export function constantPool(rows: readonly Record<string, unknown>[]) {
  const calls: RecordedQuery[] = [];
  const pool: Queryable = {
    async query<R extends QueryResultRow>(sql: string, values: readonly unknown[] = []): Promise<QueryResultLike<R>> {
      calls.push({ sql, values });
      return { rows: rows as R[] };
    },
  };
  return { calls, pool };
}

/**
 * A `Queryable` double whose response depends on the SQL text of the call
 * (e.g. `sql.includes('claim')`), for tests exercising code that issues
 * different queries in one method and expects different rows back from
 * each. Same generic-method cast rationale as `queueingPool` above.
 */
export function branchingPool(respond: (sql: string, values: readonly unknown[]) => readonly Record<string, unknown>[]) {
  const calls: RecordedQuery[] = [];
  const pool: Queryable = {
    async query<R extends QueryResultRow>(sql: string, values: readonly unknown[] = []): Promise<QueryResultLike<R>> {
      calls.push({ sql, values });
      return { rows: respond(sql, values) as R[] };
    },
  };
  return { calls, pool };
}

/**
 * `noUncheckedIndexedAccess` makes `calls[index]` be `T | undefined`. Tests
 * routinely read a specific recorded call by position; this asserts it
 * exists (failing loudly, with the actual count, if it doesn't) rather than
 * silencing the possibility with `!`.
 */
export function callAt<T>(list: readonly T[], index: number): T {
  const item = list[index];
  assert.ok(item, `expected a recorded call at index ${index}, got ${list.length} total`);
  return item;
}
