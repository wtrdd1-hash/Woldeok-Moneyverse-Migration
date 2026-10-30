import { describe, expect, it, vi } from 'vitest';
const { apiOrNull } = vi.hoisted(() => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
import { GET } from './route';

describe('private shop receipt search route', () => {
  it('forwards bounded query and prevents caches and indexing', async () => {
    apiOrNull.mockResolvedValueOnce({ purchases: [], summary: { count: 0, totalSpent: '0', scope: 'displayed' } });
    const response = await GET(new Request('https://example.test/api/shop/purchases?q=Blue%20Gloves'));
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/shop/purchases?q=Blue%20Gloves');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects duplicate or overlong query without an upstream call', async () => {
    apiOrNull.mockClear();
    expect((await GET(new Request('https://example.test/api/shop/purchases?q=a&q=b'))).status).toBe(400);
    expect((await GET(new Request(`https://example.test/api/shop/purchases?q=${'a'.repeat(81)}`))).status).toBe(400);
    expect(apiOrNull).not.toHaveBeenCalled();
  });
  it('rejects an upstream 200 with unverified spending summary', async () => {
    apiOrNull.mockResolvedValueOnce({ purchases: [], summary: { count: 1, totalSpent: '10', scope: 'displayed' } });
    expect((await GET(new Request('https://example.test/api/shop/purchases'))).status).toBe(503);
  });
  it('fails closed rather than inventing an empty purchase history', async () => {
    apiOrNull.mockResolvedValueOnce(null);
    const response = await GET(new Request('https://example.test/api/shop/purchases'));
    expect(response.status).toBe(503);
    expect(await response.json()).not.toEqual({ purchases: [] });
  });
});
