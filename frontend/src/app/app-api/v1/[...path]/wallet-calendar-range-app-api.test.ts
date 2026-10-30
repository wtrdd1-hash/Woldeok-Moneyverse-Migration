import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const base =
  'https://easy-scraping.com/app-api/v1/wallet/activity?from=2026-10-28&to=2026-10-30&direction=in';
function setup(payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const fetchSpy = vi.fn(
    async () =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}
function request(url = base) {
  return new NextRequest(url, {
    headers: {
      host: 'easy-scraping.com',
      'x-forwarded-proto': 'https',
      cookie: 'moneyverse_session=private',
    },
  });
}
const context = { params: Promise.resolve({ path: ['wallet', 'activity'] }) };
describe('Android calendar range owner-private gateway', () => {
  it('preserves exact dates and integer-string ledger evidence with noindex/no-store', async () => {
    const spy = setup({
      transactions: [
        {
          transactionId: '11111111-1111-4111-8111-111111111111',
          type: 'USER_TO_USER',
          label: 'transfer',
          netAmount: '900719925474099312345',
          cashDelta: '900719925474099312345',
          bankDelta: '0',
          direction: 'in',
          occurredAt: '2026-10-29T00:00:00.123Z',
        },
      ],
      hasMore: false,
      nextCursor: null,
      asOf: '2026-10-30T04:00:00.000Z',
    });
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(new URL(String(spy.mock.calls[0]?.[0])).searchParams.get('from')).toBe('2026-10-28');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).transactions[0].netAmount).toBe('900719925474099312345');
  });
  it('rejects malformed success payloads rather than fabricating verified range activity', async () => {
    setup({
      transactions: [{ transactionId: 'x', netAmount: 123 }],
      hasMore: false,
      nextCursor: null,
      asOf: '2026-10-30T04:00:00.000Z',
    });
    const response = await GET(request(), context);
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('wallet_range_unverified');
  });
  it.each([
    { transactions: [], hasMore: true, nextCursor: 'a.b', asOf: '2026-10-30T04:00:00.000Z' },
    {
      transactions: [
        {
          transactionId: '11111111-1111-4111-8111-111111111111',
          type: 'USER_TO_USER',
          label: 'transfer',
          netAmount: '10',
          direction: 'in',
          occurredAt: '2026-10-29T00:00:00.000Z',
        },
      ],
      hasMore: false,
      nextCursor: null,
      asOf: '2026-10-30T04:00:00.000Z',
    },
    { transactions: [], hasMore: false, nextCursor: null, asOf: '2030-01-01T00:00:00.000Z' },
  ])(
    'fails closed for incomplete pagination, missing pocket proof or future snapshot',
    async (payload) => {
      setup(payload);
      const response = await GET(request(), context);
      expect(response.status).toBe(503);
    },
  );
  it('rejects malformed or duplicated range filters before contacting backend', async () => {
    const spy = setup({
      transactions: [],
      hasMore: false,
      nextCursor: null,
      asOf: '2026-10-30T04:00:00.000Z',
    });
    const response = await GET(request(base + '&from=2026-10-29'), context);
    expect(response.status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });
});
