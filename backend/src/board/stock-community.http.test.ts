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

describe('public board display size HTTP validation', () => {
  it('returns proof only when an explicit bounded size is requested', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ limit: '10' })).resolves.toEqual({ posts: [], limitApplied: 10, sourceWindow: 50 });
    expect(community.publicList).toHaveBeenCalledWith(undefined, undefined, 10);
  });
  it.each([{ limit: '0' }, { limit: '010' }, { limit: '100' }, { limit: ['10', '25'] }, { limit: 10 }])('rejects invalid or repeated limit %j', async (query) => {
    await expect(new PublicStockCommunityController(community).list(query)).rejects.toMatchObject({ status: 400 });
  });
});
