import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from '@/lib/api';
import { GET } from './route';

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error { constructor(public status: number) { super('unavailable'); } },
  api: vi.fn(),
}));

const row = {
  id: '11111111-1111-4111-8111-111111111111', itemName: 'Verified item',
  sellerName: 'Verified seller', rarity: 'EPIC', currentBidWld: '8500.0000',
  startPriceWld: '5000.0000', bidCount: 2, endsAt: '2026-11-01T10:00:00Z', description: '',
};

describe('member auction Next API gateway', () => {
  beforeEach(() => vi.mocked(api).mockReset());
  it('returns verified SQL auction evidence with private unindexable headers', async () => {
    vi.mocked(api).mockResolvedValue([row]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect((await response.json())[0].currentBidWld).toBe('8500');
  });
  it('fails closed on invalid or inaccessible evidence without a false empty list', async () => {
    vi.mocked(api).mockResolvedValue({ auctions: [] });
    const invalid = await GET();
    expect(invalid.status).toBe(503);
    expect(invalid.headers.get('cache-control')).toBe('private, no-store');
    vi.mocked(api).mockReset().mockRejectedValueOnce(new ApiError(401));
    const denied = await GET();
    expect(denied.status).toBe(401);
  });
});
