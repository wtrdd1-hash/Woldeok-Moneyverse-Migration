import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const BASE_URL = 'https://easy-scraping.com/app-api/v1/wallet/activity?period=30d&direction=out&minAmount=900719925474099312345';
const context = { params: Promise.resolve({ path: ['wallet', 'activity'] }) };
function request(url = BASE_URL) {
  return new NextRequest(url, { headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' } });
}
function setup(payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const spy = vi.fn(async () => new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
  vi.stubGlobal('fetch', spy);
  return spy;
}
const row = { transactionId: '11111111-1111-4111-8111-111111111111', type: 'USER_TO_USER', label: 'transfer', netAmount: '-900719925474099312345', cashDelta: '-900719925474099312345', bankDelta: '0', direction: 'out', occurredAt: '2026-10-28T00:00:00.000Z' };
const page = { transactions: [row], hasMore: false, nextCursor: null, asOf: '2026-10-30T04:00:00.000Z' };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android exact owner wallet WLD minimum', () => {
  it('forwards exact string without float coercion and returns private verified page', async () => {
    const spy = setup(page);
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(new URL(String(spy.mock.calls[0]?.[0])).searchParams.get('minAmount')).toBe('900719925474099312345');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).transactions[0].netAmount).toBe('-900719925474099312345');
  });
  it.each([ { ...page, transactions: [{ ...row, netAmount: '-900719925474099312344', cashDelta: '-900719925474099312344' }] },
    { ...page, transactions: [{ ...row, netAmount: Number('-900719925474099312345') }] },
    { ...page, transactions: [{ ...row, direction: 'in' }] },
    { ...page, hasMore: true, nextCursor: 'a.b' },
  ])('fails closed on forged successful upstream payload', async (payload) => {
    setup(payload);
    const response = await GET(request(), context);
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('wallet_amount_unverified');
  });
  it.each(['minAmount=1&minAmount=2', 'minAmount=01', 'minAmount=1.2', 'minAmount=0', 'minAmount=-1'])('rejects invalid filter before proxy: %s', async (filter) => {
    const spy = setup(page);
    const response = await GET(request('https://easy-scraping.com/app-api/v1/wallet/activity?' + filter), context);
    expect(response.status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });
});
