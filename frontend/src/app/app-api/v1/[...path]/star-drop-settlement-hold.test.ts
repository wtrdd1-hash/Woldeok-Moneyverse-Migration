import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Android Star Drop settlement source truth', () => {
  it('never relays a fabricated success from a lagging backend image', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({
      success: true, rewardAmount: 100000, tier: 'legendary',
    }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await POST(new NextRequest('https://easy-scraping.com/app-api/v1/engagement/dopamine/star-drop', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tapTier: 'legendary' }),
    }), { params: Promise.resolve({ path: ['engagement', 'dopamine', 'star-drop'] }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(await response.json()).not.toHaveProperty('success', true);
    expect(upstream).not.toHaveBeenCalled();
  });
});
