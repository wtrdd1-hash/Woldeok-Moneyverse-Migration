import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const context = { params: Promise.resolve({ path: ['work', 'receipts'] }) };
const row = {
  receipt_id: '00000000-0000-4000-8000-000000000001',
  assignment_id: '00000000-0000-4000-8000-000000000002',
  code: 'DEV',
  name: 'Work',
  reward_amount: '9007199254740993',
  experience_amount: '2',
  transaction_id: null,
  created_at: '2026-10-30T00:00:00Z',
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('Android owner-private work receipt reward floor', () => {
  it('rejects duplicates before contacting upstream', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    for (const query of ['minReward=1&minReward=2', 'minReward=01', 'minReward=-1']) {
      const response = await GET(
        new NextRequest('https://easy-scraping.com/app-api/v1/work/receipts?' + query),
        context,
      );
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('verifies exact reward and filter echo and preserves owner cookie/privacy', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ scope: 'recent20', minReward: '9007199254740993', receipts: [row] }),
          {
            headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' },
          },
        ),
    );
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(
      new NextRequest(
        'https://easy-scraping.com/app-api/v1/work/receipts?minReward=9007199254740993',
        { headers: { cookie: 'moneyverse_session=owner' } },
      ),
      context,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).searchParams.get('minReward')).toBe('9007199254740993');
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner');
  });
  it('rejects legacy HTTP 200 without proof of applied filter', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ receipts: [row] }), {
            headers: { 'content-type': 'application/json' },
          }),
      ),
    );
    const response = await GET(
      new NextRequest('https://easy-scraping.com/app-api/v1/work/receipts?minReward=5'),
      context,
    );
    expect(response.status).toBe(503);
  });
});
