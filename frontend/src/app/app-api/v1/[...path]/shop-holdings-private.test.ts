import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('owner-private Android shop holdings', () => {
  for (const status of [200, 401, 403, 503]) {
    it(`overrides public cache headers for upstream ${status}`, async () => {
      vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
      vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ holdings: [] }), {
        status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400', 'x-robots-tag': 'index' },
      })));
      const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings', {
        headers: { cookie: 'moneyverse_session=owner-session' },
      }), { params: Promise.resolve({ path: ['shop', 'holdings'] }) });
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex');
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    });
  }
});
