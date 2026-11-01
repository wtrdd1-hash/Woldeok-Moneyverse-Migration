import { describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

const community = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;

describe('public board title query HTTP validation', () => {
  it('accepts only q and stock, passes q to the service', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: '  news  ' })).resolves.toEqual({ posts: [] });
    expect(community.publicList).toHaveBeenCalledWith('WDX', '  news  ', false);
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

describe('public board edited-posts HTTP filter', () => {
  it('passes the exact editedOnly=1 flag alongside title and stock', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: 'tips', editedOnly: '1' })).resolves.toEqual({ posts: [] });
    expect(community.publicList).toHaveBeenLastCalledWith('WDX', 'tips', true);
  });

  it.each([
    { editedOnly: '' },
    { editedOnly: 'true' },
    { editedOnly: '0' },
    { editedOnly: ['1', '1'] },
    { editedOnly: '1', extra: '1' },
  ])('rejects malformed or duplicate edited filter %j', async (query) => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list(query)).rejects.toMatchObject({ status: 400 });
  });
});
