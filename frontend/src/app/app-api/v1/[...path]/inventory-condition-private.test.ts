import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = { params: Promise.resolve({ path: ['shop', 'holdings'] }) };
const request = () => new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings', { headers: { cookie: 'moneyverse_session=owner' } });

describe('Android inventory condition evidence and private boundary', () => {
  it('preserves canonical bigint fields and overrides public cache headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ holdings: [{ weekly_cost: '9007199254740993', arrears_due: '0', unpaid_weeks: 0, suspended: false }] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } })));
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect((await response.json()).holdings[0].weekly_cost).toBe('9007199254740993');
  });
  it('rejects invalid 200 evidence instead of exposing a forged settled condition', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ holdings: [{ arrears_due: Number('9007199254740993'), suspended: 'false' }] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request(), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('protects owner data on upstream 401 and never converts it into an empty holdings success', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401, headers: { 'content-type': 'application/json', 'cache-control': 'public' } })));
    const response = await GET(request(), context);
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});
