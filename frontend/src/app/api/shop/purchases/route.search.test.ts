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
    expect((await GET(new Request('https://example.test/api/shop/purchases?q=a&q=b'))).status).toBe(
      400,
    );
    expect(
      (await GET(new Request(`https://example.test/api/shop/purchases?q=${'a'.repeat(81)}`)))
        .status,
    ).toBe(400);
    expect(apiOrNull).not.toHaveBeenCalled();
  });
  it('rejects an upstream 200 with unverified spending summary', async () => {
    apiOrNull.mockResolvedValueOnce({ purchases: [], summary: { count: 1, totalSpent: '10', scope: 'displayed' } });
    expect((await GET(new Request('https://example.test/api/shop/purchases'))).status).toBe(503);
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
  it('forwards exact maximum WLD and rejects a forged amount above the ceiling', async () => {
    apiOrNull.mockResolvedValueOnce({ purchases: [{ amount: '70' }] });
    const valid = await GET(new Request('https://example.test/api/shop/purchases?minAmount=41&maxAmount=70'));
    expect(valid.status).toBe(200);
    expect(apiOrNull).toHaveBeenLastCalledWith('/api/v1/shop/purchases?minAmount=41&maxAmount=70');
    apiOrNull.mockResolvedValueOnce({ purchases: [{ amount: '9007199254740993' }] });
    const forged = await GET(new Request('https://example.test/api/shop/purchases?maxAmount=70'));
    expect(forged.status).toBe(503);
    expect(forged.headers.get('cache-control')).toBe('private, no-store');
  });
  it('rejects duplicate, noncanonical and inverted maximum amounts before upstream', async () => {
    apiOrNull.mockClear();
    for (const suffix of ['maxAmount=1&maxAmount=2', 'maxAmount=0', 'maxAmount=01', 'maxAmount=-1', 'maxAmount=1.5', 'maxAmount=' + '9'.repeat(31), 'minAmount=71&maxAmount=70']) {
      expect((await GET(new Request('https://example.test/api/shop/purchases?' + suffix))).status).toBe(400);
    }
    expect(apiOrNull).not.toHaveBeenCalled();
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
    apiOrNull.mockResolvedValueOnce({ purchases: [] });
    const response = await GET(new Request('https://example.test/api/shop/purchases?q=Gloves&from=2026-10-29&to=2026-10-30'));
    expect(apiOrNull).toHaveBeenLastCalledWith('/api/v1/shop/purchases?q=Gloves&from=2026-10-29&to=2026-10-30');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects incomplete, invalid, duplicated and reversed dates before upstream', async () => {
    apiOrNull.mockClear();
    for (const query of ['from=2026-10-29', 'from=2026-02-30&to=2026-03-01', 'from=2026-10-30&to=2026-10-29', 'from=2026-10-29&from=2026-10-30&to=2026-10-30']) {
      const response = await GET(new Request(`https://example.test/api/shop/purchases?${query}`));
      expect(response.status).toBe(400);
    }
    expect(apiOrNull).not.toHaveBeenCalled();
  });
});
