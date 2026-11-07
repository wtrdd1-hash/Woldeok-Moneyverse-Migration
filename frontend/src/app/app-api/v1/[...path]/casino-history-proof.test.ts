import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['casino', 'history'] }) };
const request = () => new NextRequest('https://easy-scraping.com/app-api/v1/casino/history', {
  headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' },
});
const valid = [{
  play_id: '11111111-1111-4111-8111-111111111111', game: 'coin', choice: 'heads', outcome: 'tails',
  stake_amount: '9007199254740993', net_amount: '-9007199254740993',
  transaction_id: '22222222-2222-4222-8222-222222222222', played_at: '2026-10-30T11:00:00.000Z',
}];
function upstream(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    'content-type': 'application/json', 'cache-control': 'public, max-age=3600', 'x-robots-tag': 'index, follow',
  } });
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android casino history private source boundary', () => {
  it('rejects malformed successful history instead of forwarding HTTP 200', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => upstream([{ ...valid[0], stake_amount: 'NaN' }])));
    const response = await GET(request(), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('preserves verified exact amounts while preventing public caching', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => upstream(valid)));
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect((await response.json())[0].stake_amount).toBe('9007199254740993');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it('rejects a non-JSON success instead of forwarding an unverified receipt', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not JSON', { status: 200, headers: { 'content-type': 'text/plain' } })));
    const response = await GET(request(), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('protects upstream authentication refusals and errors', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => upstream({ code: 'unauthorized' }, 401)));
    const response = await GET(request(), context);
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});
