import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const item = {
  transactionId: '11111111-1111-4111-8111-111111111111',
  type: 'USER_TO_USER',
  label: '송금',
  occurredAt: '2026-10-28T00:00:00.000Z',
  netAmount: '900719925474099312345',
  cashDelta: '900719925474099312345',
  bankDelta: '0',
  direction: 'in',
};
const page = {
  transactions: [item],
  hasMore: false,
  nextCursor: null,
  asOf: '2026-10-30T04:00:00.000Z',
  pageSummary: {
    scope: 'VISIBLE_PAGE_ONLY',
    transactionCount: 1,
    cashDelta: item.cashDelta,
    bankDelta: '0',
    netDelta: item.netAmount,
  },
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
function call(payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    ),
  );
  return GET(
    new NextRequest('https://easy-scraping.com/app-api/v1/wallet/activity', {
      headers: {
        host: 'easy-scraping.com',
        'x-forwarded-proto': 'https',
        cookie: 'moneyverse_session=private',
      },
    }),
    { params: Promise.resolve({ path: ['wallet', 'activity'] }) },
  );
}
describe('Android owner wallet page totals proof', () => {
  it('preserves exact signed strings and private headers for verified visible-page totals', async () => {
    const response = await call(page);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).pageSummary.netDelta).toBe(item.netAmount);
  });
  it('fails closed on a forged HTTP 200 page summary', async () => {
    const response = await call({ ...page, pageSummary: { ...page.pageSummary, netDelta: '1' } });
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('wallet_page_summary_unverified');
  });
});
