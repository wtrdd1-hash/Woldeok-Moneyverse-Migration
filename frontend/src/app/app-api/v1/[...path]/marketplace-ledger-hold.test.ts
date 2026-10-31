import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android marketplace financial safety hold', () => {
  it.each([
    ['marketplace', 'listings'],
    ['marketplace', 'listings', '22222222-2222-4222-8222-222222222222', 'buy'],
  ])('rejects unsafe fixed-price mutation %j without contacting upstream', async (...parts) => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const response = await POST(new NextRequest(`https://easy-scraping.com/app-api/v1/${parts.join('/')}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
    }), { params: Promise.resolve({ path: parts }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).code).toBe('marketplace_settlement_unavailable');
    expect(upstream).not.toHaveBeenCalled();
  });
});
