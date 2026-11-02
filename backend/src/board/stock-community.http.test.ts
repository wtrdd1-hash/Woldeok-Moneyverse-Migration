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

describe('public board image-only HTTP filter', () => {
  it('passes an explicit image-only request to the bounded service', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: 'photo', withImage: '1' })).resolves.toEqual({ posts: [], imageFilter: 'with' });
    expect(community.publicList).toHaveBeenLastCalledWith('WDX', 'photo', true);
  });
  it.each([{ withImage: '0' }, { withImage: 'true' }, { withImage: '' },
    { withImage: ['1', '1'] }, { withImage: '1', unexpected: 'yes' }])(
    'rejects invalid image-only query %j before the service', async (query) => {
      const controller = new PublicStockCommunityController(community);
      await expect(controller.list(query)).rejects.toMatchObject({ status: 400 });
    },
  );
});
