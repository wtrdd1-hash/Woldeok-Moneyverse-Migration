import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const path = ['early-game', 'first-day'];
const ctx = { params: Promise.resolve({ path }) };
const request = () => new NextRequest('https://easy-scraping.com/app-api/v1/early-game/first-day', {
  headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=owner' },
});
const row = {
  step_code: 'first_tool', step_label: '첫 장비', step_detail: '실제 상점 구매',
  step_href: '/shop', step_metric: 'shop_purchase', step_verified: true,
  step_target: '1', step_progress: '1', step_unit: '개', step_done: true,
};
const setup = (payload: unknown, status = 200) => {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), {
    status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
  })));
};
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android owner first-day proof', () => {
  it('returns only verified SQL rows and never caches member progress', async () => {
    setup({ steps: [row] });
    const res = await GET(request(), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ steps: [row] });
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it('rejects success-shaped forged completion or hostile link', async () => {
    setup({ steps: [{ ...row, step_href: 'javascript:alert(1)' }] });
    const res = await GET(request(), ctx);
    expect(res.status).toBe(503);
    expect((await res.json()).steps).toBeUndefined();
    expect(res.headers.get('cache-control')).toBe('private, no-store');
  });
  it('preserves authorization failure without leaking upstream body or caching it', async () => {
    setup({ message: 'sensitive upstream diagnostic' }, 401);
    const res = await GET(request(), ctx);
    expect(res.status).toBe(401);
    expect(JSON.stringify(await res.json())).not.toContain('sensitive upstream');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
  });
});
