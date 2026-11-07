import { describe, expect, it, vi } from 'vitest';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

const community = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;

describe('public board title query HTTP validation', () => {
  it('accepts only q and stock, passes q to the service', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ stock: 'WDX', q: '  news  ' })).resolves.toEqual({ posts: [], appliedPosition: null });
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


describe('public board self-declared position HTTP validation', () => {
  it('returns appliedPosition proof for a valid disclosure filter', async () => {
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ position: 'no_position' })).resolves.toEqual({ posts: [], appliedPosition: 'no_position' });
    expect(community.publicList).toHaveBeenCalledWith(undefined, undefined, 'no_position');
  });
  it.each(['', 'unknown', ['holder', 'undisclosed'], '<script>'])('rejects invalid position %j', async (position) => {
    await expect(new PublicStockCommunityController(community).list({ position })).rejects.toMatchObject({ status: 400 });
  });
});
