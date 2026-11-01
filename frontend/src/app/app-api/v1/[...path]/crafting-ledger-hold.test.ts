import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Android crafting settlement hold', () => {
  it.each([
    ['GET', GET, ['crafting', 'recipes']],
    ['POST', POST, ['crafting', 'execute']],
  ] as const)('%s returns private 503 without calling legacy backend', async (method, handler, path) => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest(`https://easy-scraping.com/app-api/v1/${path.join('/')}`, {
      method, headers: { cookie: 'moneyverse_session=owner-session', 'content-type': 'application/json' },
      ...(method === 'POST' ? { body: JSON.stringify({ recipeId: 'tinting-basic' }) } : {}),
    });
    const response = await handler(request, { params: Promise.resolve({ path: [...path] }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(JSON.stringify(await response.json())).toMatch(/crafting.*(unavailable|unverified)|crafting_ledger_unavailable/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
