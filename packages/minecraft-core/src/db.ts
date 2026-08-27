import type { QueryResultRow } from 'pg';

/**
 * The part of a pg `QueryResult` this package reads. Declared here rather than
 * imported from the API so the host-local worker can use these modules
 * without the API — and with it NestJS — coming along. A real pg
 * `Pool`/`PoolClient` satisfies it structurally, and so does the backend's own
 * `Queryable`, which is the same shape.
 */
export interface QueryResultLike<R extends QueryResultRow> {
  rows: R[];
}

export interface Queryable {
  query<R extends QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResultLike<R>>;
}

export async function queryOne<R extends QueryResultRow>(
  db: Queryable,
  text: string,
  values?: readonly unknown[],
): Promise<R | null> {
  const result = await db.query<R>(text, values);
  return result.rows[0] ?? null;
}

export async function queryRows<R extends QueryResultRow>(
  db: Queryable,
  text: string,
  values?: readonly unknown[],
): Promise<R[]> {
  const result = await db.query<R>(text, values);
  return result.rows;
}
