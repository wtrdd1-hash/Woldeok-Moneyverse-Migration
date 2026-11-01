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


describe('verified public board stock stance filtering', () => {
  it('passes the requested bullish stance to the repository and returns source proof', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', stance: 'bullish' })).resolves.toEqual({
      posts: [], appliedStance: { value: 'bullish', scope: 'latest50' },
    });
    expect(community.publicList).toHaveBeenLastCalledWith('WDX', undefined, 'bullish');
  });
  it('accepts all as an explicit native form default', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stance: 'all' })).resolves.toEqual({ posts: [] });
  });
  it.each([{ stance: '' }, { stance: 'unknown' }, { stance: ['bullish', 'bearish'] }, { stance: 'bullish', cursor: 'x' }])(
    'rejects invalid stance query %j', async (query) => {
      await expect(new PublicStockCommunityController(community).list(query)).rejects.toMatchObject({ status: 400 });
    },
  );
});
