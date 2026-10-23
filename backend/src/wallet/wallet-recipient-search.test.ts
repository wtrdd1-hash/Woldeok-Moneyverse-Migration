import { describe, expect, it } from 'vitest';
import type { QueryResultRow } from 'pg';
import type { Queryable } from '../core/db';
import { PostgresWalletRepository } from './wallet.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';

function fakeDatabase() {
  const calls: { sql: string; values: readonly unknown[] | undefined }[] = [];
  const db: Queryable = {
    async query<R extends QueryResultRow>(sql: string, values?: readonly unknown[]) {
      calls.push({ sql, values });
      return { rows: [] as R[] };
    },
  };
  return { calls, repository: new PostgresWalletRepository(db) };
}

describe('private wallet recipient lookup', () => {
  it('treats SQL LIKE metacharacters as literal characters instead of enumerating users', async () => {
    const { calls, repository } = fakeDatabase();
    await repository.searchRecipients('%_', ACTOR);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.values).toEqual(['%\\%\\_%', ACTOR]);
    expect(calls[0]?.sql).toMatch(/ILIKE \$1 ESCAPE/);
    expect(calls[0]?.sql).toMatch(/ORDER BY .*display_name.*user_id/s);
    expect(calls[0]?.sql).toMatch(/LIMIT 10/);
  });

  it('escapes a literal backslash and preserves Korean name search', async () => {
    const { calls, repository } = fakeDatabase();
    await repository.searchRecipients(' 홍\\길 ', ACTOR);
    expect(calls[0]?.values).toEqual(['%홍\\\\길%', ACTOR]);
  });

  it('does not query the database for short, empty, or excessive input', async () => {
    const { calls, repository } = fakeDatabase();
    for (const query of ['', ' ', '%', '_', '홍', 'a'.repeat(41)]) {
      expect(await repository.searchRecipients(query, ACTOR)).toEqual([]);
    }
    expect(calls).toHaveLength(0);
  });

  it('counts Unicode code points rather than UTF-16 code units', async () => {
    const { calls, repository } = fakeDatabase();
    await repository.searchRecipients('😀홍', ACTOR);
    expect(calls).toHaveLength(1);
  });
});
