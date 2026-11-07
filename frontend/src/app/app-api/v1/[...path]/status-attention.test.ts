import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const context = { params: Promise.resolve({ path: ['status'] }) };
const row = (state: string) => ({ sourceKey: 'backend_api', displayName: 'Backend', state,
  detail: null, observedAt: '2026-11-01T00:00:00.000Z', freshnessState: 'fresh', ageMs: 0, policyVersion: 'status-v1' });
function request(query: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/status${query}`, { headers: { host: 'easy-scraping.com' } });
}

describe('Android public status attention parity', () => {
  it('rejects invalid and repeated filters without reaching upstream', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    for (const q of ['?attentionOnly=0', '?attentionOnly=1&attentionOnly=1', '?x=1']) {
      expect((await GET(request(q), context)).status).toBe(400);
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects an unfiltered successful upstream response instead of silently claiming attention', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: [row('operational')] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('?attentionOnly=1'), context);
    expect(response.status).toBe(503);
  });

  it('accepts verified attention rows and disables caching and indexing', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: [row('outage')] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } })));
    const response = await GET(request('?attentionOnly=1'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(await response.json()).toEqual({ status: [row('outage')] });
  });
});
