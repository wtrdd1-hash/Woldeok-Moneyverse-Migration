import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull } = vi.hoisted(() => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
import { GET } from './route';

const empty = { purchases: [], summary: { count: 0, totalSpent: '0', scope: 'displayed' } };
const purchase = {
  purchaseId: '00000000-0000-4000-8000-000000000011',
  itemName: 'Blue Gloves',
  amount: '40',
  purchasedAt: '2026-10-29T15:00:00.000Z',
};
const one = { purchases: [purchase], summary: { count: 1, totalSpent: '40', scope: 'displayed' } };
beforeEach(() => apiOrNull.mockReset());

describe('private shop receipt search route', () => {
  it('forwards bounded query and prevents caches and indexing', async () => {
    apiOrNull.mockResolvedValueOnce(empty);
    const response = await GET(new Request('https://example.test/api/shop/purchases?q=Blue%20Gloves'));
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/shop/purchases?q=Blue%20Gloves');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects duplicate or overlong query without an upstream call', async () => {
    for (const query of ['q=a&q=b', `q=${'a'.repeat(81)}`]) {
      expect((await GET(new Request(`https://example.test/api/shop/purchases?${query}`))).status).toBe(400);
    }
    expect(apiOrNull).not.toHaveBeenCalled();
  });
  it('rejects an upstream 200 with unverified spending summary', async () => {
    apiOrNull.mockResolvedValueOnce({ purchases: [], summary: { count: 1, totalSpent: '10', scope: 'displayed' } });
    expect((await GET(new Request('https://example.test/api/shop/purchases'))).status).toBe(503);
  });
  it('forwards exact minimum WLD without numeric coercion', async () => {
    apiOrNull.mockResolvedValueOnce(empty);
    const response = await GET(new Request('https://example.test/api/shop/purchases?q=Gloves&minAmount=9007199254740993'));
    expect(response.status).toBe(200);
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/shop/purchases?q=Gloves&minAmount=9007199254740993');
  });
  it('rejects duplicate, zero, noncanonical and overlong minimum amounts', async () => {
    for (const suffix of ['minAmount=1&minAmount=2', 'minAmount=0', 'minAmount=01', 'minAmount=-1', 'minAmount=1.5', 'minAmount=1234567890123456789012345678901']) {
      expect((await GET(new Request('https://example.test/api/shop/purchases?' + suffix))).status).toBe(400);
    }
    expect(apiOrNull).not.toHaveBeenCalled();
  });
  it('fails closed on filtered upstream amounts below the requested floor', async () => {
    apiOrNull.mockResolvedValueOnce(one);
    const response = await GET(new Request('https://example.test/api/shop/purchases?minAmount=41'));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('fails closed rather than inventing an empty purchase history', async () => {
    apiOrNull.mockResolvedValueOnce(null);
    const response = await GET(new Request('https://example.test/api/shop/purchases'));
    expect(response.status).toBe(503);
    expect(await response.json()).not.toEqual({ purchases: [] });
  });
});

describe('private KST receipt date route', () => {
  it('forwards validated dates with search and keeps privacy headers', async () => {
    apiOrNull.mockResolvedValueOnce(one);
    const response = await GET(new Request('https://example.test/api/shop/purchases?q=Gloves&from=2026-10-30&to=2026-10-30'));
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/shop/purchases?q=Gloves&from=2026-10-30&to=2026-10-30');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects incomplete, invalid, duplicated and reversed dates before upstream', async () => {
    for (const query of ['from=2026-10-29', 'from=2026-02-30&to=2026-03-01', 'from=2026-10-30&to=2026-10-29', 'from=2026-10-29&from=2026-10-30&to=2026-10-30']) {
      expect((await GET(new Request(`https://example.test/api/shop/purchases?${query}`))).status).toBe(400);
    }
    expect(apiOrNull).not.toHaveBeenCalled();
  });
  it('rejects a legacy upstream 200 whose purchase falls outside the requested KST day', async () => {
    apiOrNull.mockResolvedValueOnce(one);
    const response = await GET(new Request('https://example.test/api/shop/purchases?from=2026-10-31&to=2026-10-31'));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
