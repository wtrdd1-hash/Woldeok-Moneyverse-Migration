import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const sample = {
  pocket_id: '11111111-1111-4111-8111-111111111111', name: '비상금',
  balance: '9007199254740993', target_amount: null,
  target_date: null, theme_color: 'emerald', icon_code: 'piggy-bank', is_archived: false,
  created_at: '2026-11-01T12:00:00.000Z', updated_at: '2026-11-01T12:00:00.000Z',
};
const req = () => new NextRequest('https://easy-scraping.com/app-api/v1/banking/pockets', {
  headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=owner' },
});
const ctx = { params: Promise.resolve({ path: ['banking', 'pockets'] }) };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android owner pocket source integrity', () => {
  it.each([
    ['valid', [sample], 'application/json', 200],
    ['malformed amount', [{ ...sample, balance: 'invalid' }], 'application/json', 503],
    ['non-json', [sample], 'text/plain', 503],
    ['wrong response shape', { pockets: [] }, 'application/json', 503],
  ])('%s must preserve private source and never cache it', async (_label, body, type, expected) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), {
      status: 200, headers: { 'content-type': type, 'cache-control': 'public, max-age=3600' },
    })));
    const res = await GET(req(), ctx);
    expect(res.status).toBe(expected);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    if (expected === 200) expect(await res.json()).toEqual([sample]);
    else expect(await res.text()).not.toContain(sample.balance);
  });
  it('redacts upstream error details and keeps auth status', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('internal server detail', {
      status: 401, headers: { 'content-type': 'text/plain', 'cache-control': 'public' },
    })));
    const res = await GET(req(), ctx);
    expect(res.status).toBe(401);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(await res.text()).not.toContain('internal server detail');
  });
});
