import { describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

const community = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;

describe('public board title query HTTP validation', () => {
  it('accepts only q and stock, passes q to the service', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: '  news  ' })).resolves.toEqual({ posts: [] });
    expect(community.publicList).toHaveBeenCalledWith('WDX', '  news  ', 'recent');
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

describe('popular public board ordering', () => {
  it('forwards the explicit popular sort and certifies its bounded scope', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: 'help', sort: 'popular' })).resolves.toEqual({
      posts: [], appliedSort: { order: 'popular', scope: 'latest50' },
    });
    expect(community.publicList).toHaveBeenLastCalledWith('WDX', 'help', 'popular');
  });
  it('accepts explicit recent sort without a popularity proof marker', async () => {
    await expect(new PublicStockCommunityController(community).list({ sort: 'recent' })).resolves.toEqual({ posts: [] });
    expect(community.publicList).toHaveBeenLastCalledWith(undefined, undefined, 'recent');
  });
  it.each([{ sort: '' }, { sort: 'oldest' }, { sort: ['popular', 'popular'] }, { sort: 'popular', cursor: 'x' }])(
    'rejects invalid/ambiguous popular sort %j', async (query) => {
      await expect(new PublicStockCommunityController(community).list(query)).rejects.toMatchObject({ status: 400 });
    },
  );
});
