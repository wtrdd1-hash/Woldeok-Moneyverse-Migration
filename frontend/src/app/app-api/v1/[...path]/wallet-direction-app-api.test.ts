import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android owner wallet activity direction', () => {
  it('forwards the canonical filter without exposing private ledger pages to caches or indexing', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({
      transactions: [{ transactionId: '11111111-1111-4111-8111-111111111111', netAmount: '-900719925474099312345' }],
      hasMore: false, nextCursor: null, asOf: '2026-10-28T00:00:00.000Z',
    }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/wallet/activity?period=30d&direction=out', {
      headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['wallet', 'activity'] }) });
    expect(response.status).toBe(200);
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('direction')).toBe('out');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).transactions[0].netAmount).toBe('-900719925474099312345');
  });
});
