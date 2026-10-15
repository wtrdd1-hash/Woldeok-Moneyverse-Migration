import { describe, expect, it, vi } from 'vitest';
import { BlackMarketRepository } from './black-market.repository';
import type { Queryable } from '../core/db';

describe('secret auction GET path must be side-effect-free', () => {
  it('does not settle/charge/credit/inventory-write during listAuctions', async () => {
    const query = vi.fn(async (sql: string) => {
      if (!/^\s*SELECT\b/i.test(sql)) throw new Error('read unexpectedly wrote to financial DB');
      return { rows: [] };
    });
    const repo = new BlackMarketRepository({ query } as unknown as Queryable);
    expect(await repo.listAuctions()).toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
    const sql = String(query.mock.calls[0][0]);
    expect(sql).toMatch(/ends_at\s*>\s*clock_timestamp\(\)/i);
  });
});
