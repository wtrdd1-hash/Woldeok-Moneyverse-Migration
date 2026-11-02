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


describe('public board author filter contract', () => {
  it('returns explicit source evidence even for verified-empty results', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ author: '  홍길동  ', q: 'news' })).resolves.toEqual({
      posts: [], authorFilter: '홍길동', sourceWindow: 50,
    });
    expect(community.publicList).toHaveBeenCalledWith(undefined, 'news', '홍길동');
  });
  it.each([{ author: ['a', 'b'] }, { author: '' }, { author: ' '.repeat(4) },
    { author: 'x'.repeat(81) }, { author: '<script>' }, { author: 'a\nb' },
    { author: 'a', page: '1' }])('rejects invalid author query %j', async (query) => {
    await expect(new PublicStockCommunityController(community).list(query))
      .rejects.toMatchObject({ status: 400 });
  });
});
