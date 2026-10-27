import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TreasuryRepository } from './treasury.repository';

// Never fall back to DATABASE_URL, which may be production-linked.
const url = process.env.TREASURY_V573_ISOLATED_DATABASE_URL;
const isolated = (() => {
  if (!url) return false;
  const parsed = new URL(url);
  return parsed.hostname === '127.0.0.1' && parsed.port === '5598' && parsed.pathname === '/moneyverse_v573_isolated';
})();

describe.skipIf(!isolated)('P1 money-flow exact keyset in synthetic PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: url, max: 2 }); });
  afterAll(async () => { await pool?.end(); });

  it('returns every posting once across timestamp ties and microsecond boundaries', async () => {
    const repo = new TreasuryRepository(pool);
    const all: string[] = [];
    let cursor: string | undefined;
    for (let i = 0; i < 5; i++) {
      const page = await repo.getUserMoneyFlows(1, cursor);
      all.push(...page.items.map((item) => `${item.transaction_id}:${item.amount}:${item.direction}`));
      if (!page.next_cursor) break;
      cursor = page.next_cursor;
    }
    expect(all).toEqual([
      '00000000-0000-4000-8000-000000000011:9007199254740993:credit',
      '00000000-0000-4000-8000-000000000011:10:debit',
      '00000000-0000-4000-8000-000000000011:20:credit',
      '00000000-0000-4000-8000-000000000010:30:debit',
    ]);
    expect(new Set(all).size).toBe(4);
  });

  it('rejects UPDATE with read-only fixture credentials', async () => {
    await expect(pool.query('UPDATE public.ledger_postings SET amount=0')).rejects.toMatchObject({ code: '42501' });
  });
});
