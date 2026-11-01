import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const path = ['businesses', 'catalog'];
function request(query: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/businesses/catalog${query}`, {
    headers: { host: 'easy-scraping.com' },
  });
}

describe('Android owner business catalogue budget truth', () => {
  it('rejects invalid and duplicate budgets without contacting the backend', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    for (const query of ['?maxCost=01', '?maxCost=1&maxCost=2', '?maxCost=1e3']) {
      const response = await GET(request(query), { params: Promise.resolve({ path }) });
      expect(response.status).toBe(400);
    }
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects stale upstream success that violates the requested budget', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ businessTypes: [
      { id: '11111111-1111-4111-8111-111111111111', purchaseCost: '9007199254740993' },
    ] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } })));
    const response = await GET(request('?maxCost=9007199254740992'), { params: Promise.resolve({ path }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('forwards the exact budget and protects verified owner response headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ businessTypes: [
      { id: '11111111-1111-4111-8111-111111111111', purchaseCost: '9007199254740993' },
    ] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('?maxCost=9007199254740993'), { params: Promise.resolve({ path }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]![0])).searchParams.get('maxCost')).toBe('9007199254740993');
  });
});
