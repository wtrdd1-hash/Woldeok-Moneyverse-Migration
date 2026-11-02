import { describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

const community = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;

describe('public board title query HTTP validation', () => {
  it('accepts only q and stock, passes q to the service', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: '  news  ' })).resolves.toEqual({ posts: [] });
    expect(community.publicList).toHaveBeenCalledWith('WDX', '  news  ');
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

describe('public board stock-symbol sort HTTP contract', () => {
  it('accepts stock-symbol order alongside existing filters and returns source proof', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: 'news', sort: 'stock-symbol' })).resolves.toEqual({
      posts: [], sortApplied: 'stock-symbol',
    });
    expect(community.publicList).toHaveBeenCalledWith('WDX', 'news', 'stock-symbol');
  });

  it.each([{ sort: ['recent', 'stock-symbol'] }, { sort: 'unknown' }, { sort: '' }, { sort: 'STOCK-SYMBOL' }])(
    'rejects ambiguous or invalid sort %j', async (query) => {
      const controller = new PublicStockCommunityController(community);
      await expect(controller.list(query)).rejects.toMatchObject({ status: 400 });
    },
  );
});
