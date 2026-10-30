import { describe, expect, it, vi } from 'vitest';
const { apiOrNull } = vi.hoisted(() => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
import { GET } from './route';

describe('private shop receipt search route', () => {
  it('forwards bounded query and prevents caches and indexing', async () => {
    apiOrNull.mockResolvedValueOnce({ purchases: [] });
    const response = await GET(
      new Request('https://example.test/api/shop/purchases?q=Blue%20Gloves'),
    );
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/shop/purchases?q=Blue%20Gloves');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects duplicate or overlong query without an upstream call', async () => {
    apiOrNull.mockClear();
    expect((await GET(new Request('https://example.test/api/shop/purchases?q=a&q=b'))).status).toBe(
      400,
    );
    expect(
      (await GET(new Request(`https://example.test/api/shop/purchases?q=${'a'.repeat(81)}`)))
        .status,
    ).toBe(400);
    expect(apiOrNull).not.toHaveBeenCalled();
  });
  it('forwards exact minimum WLD without numeric coercion', async () => {
    apiOrNull.mockResolvedValueOnce({ purchases: [] });
    const response = await GET(
      new Request('https://example.test/api/shop/purchases?q=Gloves&minAmount=9007199254740993'),
    );
    expect(response.status).toBe(200);
    expect(apiOrNull).toHaveBeenCalledWith(
      '/api/v1/shop/purchases?q=Gloves&minAmount=9007199254740993',
    );
  });
  it('rejects duplicate, zero, noncanonical and overlong minimum amounts', async () => {
    apiOrNull.mockClear();
    for (const suffix of [
      'minAmount=1&minAmount=2',
      'minAmount=0',
      'minAmount=01',
      'minAmount=-1',
      'minAmount=1.5',
      'minAmount=1234567890123456789012345678901',
    ]) {
      expect(
        (await GET(new Request('https://example.test/api/shop/purchases?' + suffix))).status,
      ).toBe(400);
    }
    expect(apiOrNull).not.toHaveBeenCalled();
  });
  it('fails closed on filtered upstream amounts below the requested floor', async () => {
    apiOrNull.mockResolvedValueOnce({ purchases: [{ amount: '40' }] });
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
