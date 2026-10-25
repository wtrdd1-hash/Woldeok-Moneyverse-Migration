import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { api, ApiError } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  apiOrNull: vi.fn(async () => null),
  ApiError: class ApiError extends Error {
    constructor(readonly status: number) { super('upstream error'); }
  },
}));

const purchase = {
  purchaseId: '11111111-1111-4111-8111-111111111111',
  itemId: '22222222-2222-4222-8222-222222222222',
  itemName: 'Verified item',
  transactionId: '33333333-3333-4333-8333-333333333333',
  amount: '900719925474099312345678901234567890',
  purchasedAt: '2026-10-25T00:00:00.000Z',
};

afterEach(() => vi.resetAllMocks());

describe('private shop purchase receipts gateway', () => {
  it('preserves exact database purchase evidence and disables shared caching', async () => {
    vi.mocked(api).mockResolvedValue({ purchases: [purchase] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(await response.json()).toEqual({ purchases: [purchase] });
    expect(api).toHaveBeenCalledWith('/api/v1/shop/purchases');
  });

  it('shows an empty list only when the backend confirms it', async () => {
    vi.mocked(api).mockResolvedValue({ purchases: [] });
    expect(await (await GET()).json()).toEqual({ purchases: [] });
  });

  it.each([401, 403])('preserves upstream authorization failure %i', async (status) => {
    vi.mocked(api).mockRejectedValue(new ApiError(status));
    const response = await GET();
    expect(response.status).toBe(status);
    expect((await response.json()).purchases).toBeUndefined();
  });

  it('never converts upstream outages to an empty purchase history', async () => {
    vi.mocked(api).mockRejectedValue(new Error('database unavailable'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).purchases).toBeUndefined();
  });

  it.each([null, {}, { purchases: null }, { purchases: [{ ...purchase, amount: 12 }] }, { purchases: [purchase, purchase] }])(
    'rejects malformed or ambiguous upstream purchase evidence', async (payload) => {
      vi.mocked(api).mockResolvedValue(payload);
      const response = await GET();
      expect(response.status).toBe(503);
      expect((await response.json()).purchases).toBeUndefined();
    },
  );
});
