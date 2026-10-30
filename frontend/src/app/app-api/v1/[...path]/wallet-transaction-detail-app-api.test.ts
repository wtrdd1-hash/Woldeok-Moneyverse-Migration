import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const TX = '55555555-5555-4555-8555-555555555555';
const good = {
  transactionId: TX,
  typeLabel: '은행 입금',
  occurredAtUtcMicros: '2026-10-30T04:05:06.123456Z',
  cashDelta: '-10',
  bankDelta: '10',
  netDelta: '0',
  currency: 'WLD',
  readStatus: 'READ_OK',
  reconciliationStatus: 'NOT_ASSESSED',
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('Android private transaction detail fail-closed gateway', () => {
  it.each([
    [good, 200],
    [{ ...good, netDelta: '1' }, 503],
    [{ transactionId: TX, netDelta: '0' }, 503],
  ])('proves upstream response and strips cache/referrer for %s', async (payload, expected) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify(payload), {
            status: 200,
            headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' },
          }),
      ),
    );
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/wallet/activity/transactions/' + TX,
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['wallet', 'activity', 'transactions', TX] }),
    });
    expect(response.status).toBe(expected);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
});
