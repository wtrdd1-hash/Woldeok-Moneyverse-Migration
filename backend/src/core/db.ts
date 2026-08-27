import type { QueryResultRow } from 'pg';

/**
 * The part of a pg `QueryResult` every consumer in this codebase actually
 * reads. No repository or service inspects `command`, `rowCount`, `oid`, or
 * `fields`, so `Queryable` only demands `rows` — a real pg `Pool`/`PoolClient`
 * still satisfies this structurally, since its `QueryResult` is a superset.
 */
export interface QueryResultLike<R extends QueryResultRow> {
  rows: R[];
}

/**
 * The subset of a pg Pool or PoolClient the repositories use. Narrowing to
 * this makes the test doubles typeable without importing pg into them.
 */
export interface Queryable {
  query<R extends QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResultLike<R>>;
}

/**
 * Row types are assertions about the schema, not proofs. Each repository
 * annotates its row interfaces with the migration that defines the columns.
 */
export async function queryRows<R extends QueryResultRow>(
  db: Queryable,
  text: string,
  values: readonly unknown[] = [],
): Promise<R[]> {
  const result = await db.query<R>(text, values);
  return result.rows;
}

export async function queryOne<R extends QueryResultRow>(
  db: Queryable,
  text: string,
  values: readonly unknown[] = [],
): Promise<R | null> {
  const rows = await queryRows<R>(db, text, values);
  return rows[0] ?? null;
}
