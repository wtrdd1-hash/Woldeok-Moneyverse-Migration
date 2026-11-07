import { describe, expect, it, vi } from 'vitest';
import { MarketplaceService } from './marketplace.service';
import type { Queryable } from '../core/db';

describe('member marketplace listing search contract', () => {
  it('passes literal wildcard-safe pattern into the existing owner-safe SQL read', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new MarketplaceService({ query } as unknown as Queryable);
    await service.listListings({ search: '50%_\\sale', limit: 50 });
    expect(query).toHaveBeenCalledOnce();
    const [sql, args] = query.mock.calls[0]!;
    expect(sql).toContain('public.marketplace_active_listings(');
    expect(args).toEqual([null, '%50\\%\\_\\\\sale%', 50, 0]);
  });

  it('keeps empty search as no filter and never mutates ledger', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new MarketplaceService({ query } as unknown as Queryable);
    expect(await service.listListings({ limit: 50 })).toEqual([]);
    expect(query.mock.calls[0]![1]).toEqual([null, null, 50, 0]);
    expect(query.mock.calls[0]![0]).toMatch(/^SELECT /);
  });
});
