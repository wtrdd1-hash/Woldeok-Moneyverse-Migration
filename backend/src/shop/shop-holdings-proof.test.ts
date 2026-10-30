import { describe, expect, it, vi } from 'vitest';
import { ShopCatalogRepository } from './shop.repository';

describe('member inventory PostgreSQL read boundary', () => {
  it('uses the owner-scoped SECURITY DEFINER function, not a direct user_items table read', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new ShopCatalogRepository({ query } as never);
    const actor = '00000000-0000-4000-8000-000000000001';
    expect(await repo.holdings(actor)).toEqual([]);
    const [sql, values] = query.mock.calls[0] as unknown as [string, string[]];
    expect(sql).toContain('FROM public.shop_my_items_v2($1)');
    expect(sql).toContain('holding.weekly_cost::text AS weekly_cost');
    expect(sql).not.toContain('FROM public.user_items');
    expect(values).toEqual([actor]);
  });
  it('rejects an invalid actor before any database query', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new ShopCatalogRepository({ query } as never);
    await expect(repo.holdings('foreign actor')).rejects.toThrow('authenticated user id');
    expect(query).not.toHaveBeenCalled();
  });
});
