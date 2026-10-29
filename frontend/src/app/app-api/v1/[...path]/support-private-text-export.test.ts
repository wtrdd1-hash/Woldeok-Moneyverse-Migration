import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android private support text transcript', () => {
  it('overrides cacheable upstream headers and retains owner session for a private transcript', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const spy = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ threadId: 'b0000000-0000-4000-8000-000000000002', text: 'private', truncated: false }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', spy);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/support/threads/b0000000-0000-4000-8000-000000000002/transcript/text', { headers: { cookie: 'moneyverse_session=owner' } }), { params: Promise.resolve({ path: ['support','threads','b0000000-0000-4000-8000-000000000002','transcript','text'] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new Headers(spy.mock.calls[0]![1]?.headers).get('cookie')).toContain('moneyverse_session=owner');
  });
});
