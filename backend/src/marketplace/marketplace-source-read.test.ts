import { describe, expect, it, vi } from 'vitest';
import { MarketplaceService } from './marketplace.service';
import type { Queryable } from '../core/db';

describe('marketplace source read contract', () => {
  it('reads active listings through an audited SECURITY DEFINER function, not direct table grants', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 'verified-id', price_wld: '100' }] });
    const service = new MarketplaceService({ query } as unknown as Queryable);
    await expect(service.listListings({ limit: 50 })).resolves.toEqual([{ id: 'verified-id', price_wld: '100' }]);
    expect(query).toHaveBeenCalledOnce();
    const sql = String(query.mock.calls[0]?.[0]);
    expect(sql).toContain('public.marketplace_active_listings(');
    expect(sql).not.toContain('FROM public.marketplace_listings');
    expect(query.mock.calls[0]?.[1]).toEqual([null, null, 50, 0]);
  });

  it('keeps owner listings bound to the authenticated actor and never queries raw tables', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new MarketplaceService({ query } as unknown as Queryable);
    const actor = '11111111-1111-4111-8111-111111111111';
    await expect(service.listMyListings(actor)).resolves.toEqual([]);
    expect(String(query.mock.calls[0]?.[0])).toContain('public.marketplace_owner_listings(');
    expect(query.mock.calls[0]?.[1]).toEqual([actor]);
  });
});
