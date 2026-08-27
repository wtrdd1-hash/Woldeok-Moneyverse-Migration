import { describe, expect, it } from 'vitest';
import type { Queryable } from './db';
import { queryOne, queryRows } from './db';

function stubQueryable(rows: Record<string, unknown>[]): Queryable & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  return {
    calls,
    async query(text: string, values?: readonly unknown[]) {
      calls.push([text, values]);
      return { rows: rows as never[] };
    },
  };
}

describe('queryRows', () => {
  it('returns every row', async () => {
    const db = stubQueryable([{ id: 'a' }, { id: 'b' }]);
    await expect(queryRows(db, 'SELECT 1')).resolves.toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('passes an empty parameter list when none is given', async () => {
    const db = stubQueryable([]);
    await queryRows(db, 'SELECT 1');
    expect(db.calls[0]).toEqual(['SELECT 1', []]);
  });
});

describe('queryOne', () => {
  it('returns the first row', async () => {
    const db = stubQueryable([{ id: 'a' }, { id: 'b' }]);
    await expect(queryOne(db, 'SELECT 1')).resolves.toEqual({ id: 'a' });
  });

  // null rather than undefined: exactOptionalPropertyTypes is on, and callers
  // distinguish "no row" from "not supplied".
  it('returns null for an empty result rather than undefined', async () => {
    const db = stubQueryable([]);
    await expect(queryOne(db, 'SELECT 1')).resolves.toBeNull();
  });
});
