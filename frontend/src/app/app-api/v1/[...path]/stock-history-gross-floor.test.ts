import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const base = 'https://easy-scraping.com/app-api/v1/stocks/history?limit=100&minGross=900719925474099312345';
const ctx = { params: Promise.resolve({ path: ['stocks', 'history'] }) };
function req(url: string) {
  return new NextRequest(url, { headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' } });
}
describe('Android owner stock trade gross filter', () => {
  it('rejects duplicated or invalid minimum before contacting backend', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const url of [base + '&minGross=2', base.replace('900719925474099312345', '1e5')]) {
      const response = await GET(req(url), ctx);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toContain('no-store');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('forwards exact threshold and rejects stale or forged success data', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ trades: [{ trade_id: 'a', gross_amount: '1' }] }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(req(base), ctx);
    expect(response.status).toBe(503);
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('minGross')).toBe('900719925474099312345');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('preserves verified owner rows and forces private no-store and noindex', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ trades: [{
      trade_id: '11111111-1111-4111-8111-111111111111', symbol: 'MV', side: 'buy', quantity: '1', unit_price: '900719925474099312345', gross_amount: '900719925474099312345', tax_amount: '0', created_at: '2026-10-30T00:00:00Z',
    }] }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } })));
    const response = await GET(req(base), ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).trades[0].gross_amount).toBe('900719925474099312345');
  });
});
