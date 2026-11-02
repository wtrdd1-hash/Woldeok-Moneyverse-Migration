import { describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

const community = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;

describe('public board title query HTTP validation', () => {
  it('accepts only q and stock, passes q to the service', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: '  news  ' })).resolves.toEqual({ posts: [], appliedTopic: null });
    expect(community.publicList).toHaveBeenCalledWith('WDX', '  news  ', undefined);
  });
  it.each([
    { q: ['a', 'b'] },
    { q: '' },
    { q: 'x'.repeat(81) },
    { q: 'hello', page: '2' },
    { stock: ['WDX', 'AAA'] },
    { stock: '<bad>' },
  ])('rejects ambiguous or invalid query %j as HTTP 400', async (query) => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list(query)).rejects.toMatchObject({ status: 400 });
  });
});

describe('public board topic scope HTTP contract', () => {
  it('forwards a validated stock/general topic and reports applied source proof', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ topic: 'stock', q: 'WLD' })).resolves.toEqual({
      posts: [], appliedTopic: 'stock',
    });
    expect(community.publicList).toHaveBeenCalledWith(undefined, 'WLD', 'stock');
  });

  it.each([{ topic: '' }, { topic: 'all' }, { topic: 'STOCK' }, { topic: ['stock', 'general'] }, { topic: 'general', unexpected: '1' }])(
    'rejects invalid or duplicate topic query %j', async (query) => {
      const controller = new PublicStockCommunityController(community);
      await expect(controller.list(query)).rejects.toMatchObject({ status: 400 });
    },
  );
});
