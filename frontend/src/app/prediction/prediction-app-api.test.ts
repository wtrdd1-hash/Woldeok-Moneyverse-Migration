import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../app-api/v1/[...path]/route';

describe('Android prediction trade safety', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('never proxies a fabricated market response as a verified success', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const response = await GET(new NextRequest('https://example.test/app-api/v1/predictions/markets'),
      { params: Promise.resolve({ path: ['predictions', 'markets'] }) });
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('PREDICTION_MARKET_UNVERIFIED');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('never sends a prediction buy request or returns a success receipt', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const response = await POST(new NextRequest('https://example.test/app-api/v1/predictions/orders',
      { method: 'POST', body: JSON.stringify({ marketId: 'pred-1', stakeWld: '10000' }) }),
      { params: Promise.resolve({ path: ['predictions', 'orders'] }) });
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('PREDICTION_SETTLEMENT_UNAVAILABLE');
    expect(fetch).not.toHaveBeenCalled();
  });
});
