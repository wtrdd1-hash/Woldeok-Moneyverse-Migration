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

describe('public board minimum reply HTTP validation', () => {
  it('returns the applied minimum and forwards it to the SQL-backed service', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', minReplies: '5' })).resolves.toEqual({ posts: [], minReplies: 5 });
    expect(community.publicList).toHaveBeenCalledWith('WDX', undefined, 5);
  });
  it.each([{ minReplies: ['2', '5'] }, { minReplies: '0' }, { minReplies: '01' }, { minReplies: '11' }, { minReplies: '-1' }, { minReplies: '2', unknown: 'x' }])(
    'rejects invalid minimum %j', async (query) => {
      await expect(new PublicStockCommunityController(community).list(query)).rejects.toMatchObject({ status: 400 });
    },
  );
});
