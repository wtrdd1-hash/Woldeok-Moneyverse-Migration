import { describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

const community = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;

describe('public board title query HTTP validation', () => {
  it('accepts only q and stock, passes q to the service', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: '  news  ' })).resolves.toEqual({ posts: [] });
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


describe('public board category HTTP contract', () => {
  it('forwards a recognized stock-linked category to the repository', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ category: 'analysis' })).resolves.toEqual({ posts: [] });
    expect(community.publicList).toHaveBeenLastCalledWith(undefined, undefined, 'analysis');
  });
  it.each([{ category: ['analysis', 'question'] }, { category: 'all' }, { category: 'ANALYSIS' }, { category: '' }, { category: 'unknown' }])(
    'rejects invalid or duplicate category %j', async (query) => {
      await expect(new PublicStockCommunityController(community).list(query)).rejects.toMatchObject({ status: 400 });
    },
  );
});
