import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = (member: boolean) => ({ params: Promise.resolve({ path: ['shop', member ? 'catalog' : 'public-catalog'] }) });
const url = (member: boolean, suffix: string) => `https://easy-scraping.com/app-api/v1/shop/${member ? 'catalog' : 'public-catalog'}?${suffix}`;

describe('Android exact weekly upkeep ceiling', () => {
  it.each([false, true])('rejects duplicate, malformed or noncanonical cap before upstream (member=%s)', async (member) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    for (const suffix of ['maxUpkeep=1&maxUpkeep=2', 'maxUpkeep=01', 'maxUpkeep=-1', 'maxUpkeep=1.5']) {
      const response = await GET(new NextRequest(url(member, suffix)), context(member));
      expect(response.status).toBe(400);
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it.each([false, true])('forwards cap and verifies returned upkeep instead of accepting an unfiltered HTTP 200 (member=%s)', async (member) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ catalogItems: [
      { code: 'free', maintenance_cost: '0' }, { code: 'expensive', maintenance_cost: '9007199254740994' },
    ] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(new NextRequest(url(member, 'maxUpkeep=9007199254740993')), context(member));
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('maxUpkeep')).toBe('9007199254740993');
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('accepts a verified public catalogue with exact large integers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ catalogItems: [
      { code: 'free', maintenance_cost: '0' }, { code: 'limit', maintenance_cost: '9007199254740993' },
    ] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(new NextRequest(url(false, 'maxUpkeep=9007199254740993')), context(false));
    expect(response.status).toBe(200);
    expect((await response.json()).catalogItems).toHaveLength(2);
  });
});
