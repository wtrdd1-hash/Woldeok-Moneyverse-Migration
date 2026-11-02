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


describe('exact title HTTP contract', () => {
  it('returns provenance for exact title queries even for empty results', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ q: '  WLD  ', match: 'exact' })).resolves.toEqual({
      posts: [], titleMatch: 'exact', titleQuery: 'WLD',
    });
    expect(community.publicList).toHaveBeenCalledWith(undefined, '  WLD  ', 'exact');
  });
  it.each([{match:'exact'}, {q:'WLD',match:'partial'}, {q:'WLD',match:['exact','exact']}])(
    'rejects ambiguous exact mode %j', async query => {
      await expect(new PublicStockCommunityController(community).list(query)).rejects.toMatchObject({status:400});
    },
  );
});
