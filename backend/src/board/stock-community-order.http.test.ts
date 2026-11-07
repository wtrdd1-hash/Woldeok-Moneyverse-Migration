import { describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import type { StockCommunityService } from './stock-community.service';

describe('public board chronological order HTTP contract', () => {
  it('passes a validated oldest order and returns a proof of the applied order', async () => {
    const publicList = vi.fn(async () => []);
    const controller = new PublicStockCommunityController({ publicList } as unknown as StockCommunityService);
    await expect(controller.list({ stock: 'WDX', q: '  news  ', order: 'oldest' }))
      .resolves.toEqual({ posts: [], order: 'oldest' });
    expect(publicList).toHaveBeenCalledWith('WDX', '  news  ', 'oldest');
  });
  it('preserves the default response for old clients', async () => {
    const publicList = vi.fn(async () => []);
    const controller = new PublicStockCommunityController({ publicList } as unknown as StockCommunityService);
    await expect(controller.list({})).resolves.toEqual({ posts: [] });
  });
  it.each([{ order: ['oldest','newest'] }, { order: '' }, { order: 'random' }, { order: 'OLDEST' }, { order: 1 }])(
    'rejects ambiguous/invalid order %j as 400', async query => {
      const controller = new PublicStockCommunityController({ publicList: vi.fn() } as unknown as StockCommunityService);
      await expect(controller.list(query)).rejects.toMatchObject({ status: 400 });
    },
  );
});
