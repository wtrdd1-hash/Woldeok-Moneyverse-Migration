import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe('Android owner notification read filter', () => {
  it('forwards the readOnly filter and keeps the response private', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(
      async () =>
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/notifications?readOnly=true&category=SECURITY',
      {
        headers: { cookie: 'moneyverse_session=owner-session' },
      },
    );
    const response = await GET(request, { params: Promise.resolve({ path: ['notifications'] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [target, options] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).searchParams.get('readOnly')).toBe('true');
    expect(new URL(String(target)).searchParams.get('category')).toBe('SECURITY');
    expect(new Headers(options.headers).get('cookie')).toContain('owner-session');
  });
});
