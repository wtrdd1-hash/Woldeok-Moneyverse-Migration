import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['clubs'] }) };
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('authenticated club directory Android API privacy', () => {
  for (const status of [200, 503]) {
    it(`never caches or indexes owner club membership on upstream ${status}`, async () => {
      vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
      vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
      vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(status === 200 ? { clubs: [] } : { message: 'unavailable' }), {
        status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', 'x-robots-tag': 'index, follow' },
      })));
      const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/clubs?limit=50&offset=0', {
        headers: { cookie: 'moneyverse_session=owner-session' },
      }), context);
      expect(response.status).toBe(status);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex');
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    });
  }
});
