import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

function request() {
  return new NextRequest('https://easy-scraping.com/app-api/v1/enterprises/public', {
    headers: { host: 'easy-scraping.com' },
  });
}
const context = { params: Promise.resolve({ path: ['enterprises', 'public'] }) };

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Android public enterprise disclosure proxy', () => {
  it('preserves verified DB source and exact large WLD integer strings', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({
      source: 'DATABASE_SNAPSHOT', settlementStatus: 'NOT_VERIFIED',
      overview: { total_soe_assets_wld: '9007199254740993' },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(fetchSpy.mock.calls.length).toBe(1);
    const body = await response.json();
    expect(body.overview.totalSoeAssetsWld).toBe('9007199254740993');
    expect(body.settlementStatus).toBe('NOT_VERIFIED');
  });

  it('does not turn an upstream 503 into a fake success', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: 503, detail: 'enterprise disclosure unavailable' }), {
      status: 503, headers: { 'content-type': 'application/problem+json' },
    })));
    const response = await GET(request(), context);
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('365000000');
  });
});
