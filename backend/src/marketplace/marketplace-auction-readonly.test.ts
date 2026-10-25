import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Pool } from 'pg';
import type { Queryable } from '../core/db';
import { databaseUrl } from '../testing/database';
import { MarketplaceService } from './marketplace.service';

describe('authenticated marketplace auction listing source', () => {
  it('queries only the active PostgreSQL auction table and preserves exact WLD strings', async () => {
    const query = vi.fn(async (sql: string) => {
      if (!/^\s*SELECT\b/i.test(sql)) throw new Error('Auction listing performed a mutation');
      return { rows: [{ id: 'f5a80e7c-2e4d-4f52-a12c-7b27b0f5b312', currentBidWld: '9007199254740994' }] };
    });
    const service = new MarketplaceService({ query } as unknown as Queryable);
    const rows = await service.listAuctions();
    expect(rows).toEqual([{ id: 'f5a80e7c-2e4d-4f52-a12c-7b27b0f5b312', currentBidWld: '9007199254740994' }]);
    expect(String(query.mock.calls[0]?.[0])).toContain("WHERE status = 'ACTIVE'");
  });
});

const url = databaseUrl();
describe.skipIf(!url)('marketplace auction listing against isolated real PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: url, max: 1 }); });
  afterAll(async () => { await pool?.end(); });
  it('reads real auction rows without writes or fabricated fixtures', async () => {
    const rows = await new MarketplaceService(pool).listAuctions();
    expect(Array.isArray(rows)).toBe(true);
    for (const row of rows as Record<string, unknown>[]) {
      expect(row.id).toEqual(expect.stringMatching(/^[0-9a-f-]{36}$/i));
      expect(row.currentBidWld).toEqual(expect.stringMatching(/^[0-9]+(?:\.[0-9]{1,4})?$/));
    }
  });
});
