import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const url = 'https://easy-scraping.com/app-api/v1/work/receipts';
const headers = { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' };
const ctx = { params: Promise.resolve({ path: ['work', 'receipts'] }) };
function setup(rows: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ receipts: rows }), {
    status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
  }));
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}
const row = (reward_amount: unknown) => ({
  receipt_id: '11111111-2222-4333-8444-555555555555',
  assignment_id: '22222222-2222-4333-8444-555555555555',
  code: 'test', name: 'Task', reward_amount, experience_amount: '1',
  transaction_id: null, created_at: '2026-10-31T00:00:00Z',
});
describe('Android owner work receipt ceiling', () => {
  it('forwards a canonical integer and refuses cache or indexing', async () => {
    const fetchSpy = setup([row('9007199254740993')]);
    const res = await GET(new NextRequest(url + '?maxReceiptReward=9007199254740993', { headers }), ctx);
    expect(res.status).toBe(200);
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('maxReceiptReward')).toBe('9007199254740993');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects duplicate and malformed query values without contacting backend', async () => {
    const fetchSpy = setup([]);
    for (const q of ['maxReceiptReward=1&maxReceiptReward=1', 'maxReceiptReward=1e3']) {
      expect((await GET(new NextRequest(url + '?' + q, { headers }), ctx)).status).toBe(400);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('rejects forged success rows above the ceiling and malformed amounts', async () => {
    setup([row('11')]);
    expect((await GET(new NextRequest(url + '?maxReceiptReward=10', { headers }), ctx)).status).toBe(503);
    setup([row(9)]);
    expect((await GET(new NextRequest(url + '?maxReceiptReward=10', { headers }), ctx)).status).toBe(503);
  });
});
