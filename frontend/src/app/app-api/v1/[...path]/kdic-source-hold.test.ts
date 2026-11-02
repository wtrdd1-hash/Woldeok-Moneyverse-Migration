import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android KDIC coverage fail closed', () => {
  it.each(['portal', 'my-coverage'])('never forwards a fabricated %s success', async (path) => {
    const upstream = vi.fn(async () => new Response(JSON.stringify({ success: true, data: { isFullyProtected: true } }), { status: 200 }));
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest(`https://easy-scraping.com/app-api/v1/kdic/${path}`, {
      headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['kdic', path] }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).code).toBe('KDIC_COVERAGE_UNVERIFIED');
    expect(upstream).not.toHaveBeenCalled();
  });
});
