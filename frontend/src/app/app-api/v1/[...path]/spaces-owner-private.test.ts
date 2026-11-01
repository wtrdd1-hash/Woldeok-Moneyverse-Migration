import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = { params: Promise.resolve({ path: ['spaces'] }) };
const url = 'https://easy-scraping.com/app-api/v1/spaces';
const row = { id: '33333333-4444-4555-8666-777777777777', user_id: '11111111-2222-4333-8444-555555555555', space_type: 'SPACE_STUDIO', name: 'Verified Studio', privacy: 'private', layout: {}, created_at: '2026-10-31T00:00:00.000Z', updated_at: '2026-10-31T01:00:00.000Z' };

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } });
}

describe('Android owner spaces source integrity', () => {
  it('preserves verified owner data, forwards session and forces privacy on success', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => response({ spaces: [row] }));
    vi.stubGlobal('fetch', fetchSpy);
    const result = await GET(new NextRequest(url, { headers: { cookie: 'moneyverse_session=owner' } }), context);
    expect(result.status).toBe(200);
    expect((await result.json()).spaces).toHaveLength(1);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
    expect(result.headers.get('referrer-policy')).toBe('no-referrer');
    const [, options] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new Headers(options.headers).get('cookie')).toBe('moneyverse_session=owner');
  });
  it('rejects forged success instead of returning fake owner data', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => response({ spaces: [{ ...row, id: 'local-space' }] })));
    const result = await GET(new NextRequest(url), context);
    expect(result.status).toBe(503);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
  });
  it('keeps private headers on upstream auth failure', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => response({ code: 'unauthorized' }, 401)));
    const result = await GET(new NextRequest(url), context);
    expect(result.status).toBe(401);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
  });
});
