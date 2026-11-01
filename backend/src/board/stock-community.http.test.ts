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


describe('public board Seoul-day HTTP query', () => {
  it('forwards a validated day to the service', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ day: '2026-11-01' })).resolves.toEqual({ posts: [], appliedDay: '2026-11-01' });
    expect(community.publicList).toHaveBeenCalledWith(undefined, undefined, '2026-11-01');
  });
  it.each([{ day: ['2026-11-01', '2026-11-02'] }, { day: '2026-02-30' }, { day: '2026-11-01', unknown: 'x' }])('rejects invalid day query %j', async query => {
    await expect(new PublicStockCommunityController(community).list(query)).rejects.toMatchObject({ status: 400 });
  });
});
