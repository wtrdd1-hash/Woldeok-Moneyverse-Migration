import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../app-api/v1/[...path]/route';
const context = (end: string) => ({ params: Promise.resolve({ path: ['bonds', end] }) });
const request = (end: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/bonds/${end}`, {
  headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'mv_session=owner' },
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android owner bond reads', () => {
  it('rejects malformed success and hides upstream owner data and public caching', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{ id: 'bad', principal_wld: 'secret' }]), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request('my-repo-loans'), context('my-repo-loans'));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(JSON.stringify(await response.json())).not.toContain('secret');
  });
  it('preserves verified empty owner holdings with private no-store and noindex', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response('[]', { status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } })));
    const response = await GET(request('my-holdings'), context('my-holdings'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it('does not relay upstream error bodies on owner holdings', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response('private database error', { status: 500 })));
    const response = await GET(request('my-holdings'), context('my-holdings'));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.text()).not.toContain('private database error');
  });
});
