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

describe('public board recent-period HTTP validation', () => {
  it('passes a single UTC cutoff to the SQL-backed service and returns source evidence', async () => {
    const controller = new PublicStockCommunityController(community);
    const before = Date.now();
    const result = await controller.list({ stock: 'WDX', q: 'news', period: '7d' });
    expect(result).toMatchObject({ posts: [], period: '7d', cutoffUtc: expect.any(String) });
    const cutoff = Date.parse((result as { cutoffUtc: string }).cutoffUtc);
    expect(cutoff).toBeGreaterThanOrEqual(before - 7 * 86_400_000 - 1000);
    expect(cutoff).toBeLessThanOrEqual(Date.now() - 7 * 86_400_000);
    expect(community.publicList).toHaveBeenCalledWith('WDX', 'news', new Date(cutoff).toISOString());
  });

  it.each([{ period: 'week' }, { period: '' }, { period: ['7d', '30d'] }, { period: '24H' }])(
    'rejects invalid or duplicate recent period %j', async (query) => {
      await expect(new PublicStockCommunityController(community).list(query)).rejects.toMatchObject({ status: 400 });
    },
  );
});
