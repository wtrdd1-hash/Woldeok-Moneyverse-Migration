import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const path = ['casino', 'history'];
const context = { params: Promise.resolve({ path }) };
const id = '00000000-0000-4000-8000-000000000001';
const row = { play_id: id, game: 'coin', choice: 'heads', outcome: 'tails', stake_amount: '10', net_amount: '-10', transaction_id: id, played_at: '2026-10-30T03:00:00.000Z' };

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android owner arcade history game filter', () => {
  it('rejects ambiguous game filters before forwarding', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    for (const suffix of ['game=coin&game=dice_parity', 'game=roulette']) {
      const response = await GET(new NextRequest(`https://easy-scraping.com/app-api/v1/casino/history?${suffix}`), context);
      expect(response.status).toBe(400);
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it('forwards the filter with session and returns verified private evidence', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify([row]), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/casino/history?game=coin', { headers: { cookie: 'moneyverse_session=owner' } }), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(await response.json()).toMatchObject([row]);
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('game')).toBe('coin');
  });
  it('rejects mismatched, malformed and non-JSON HTTP 200 upstream claims', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify([{ ...row, game: 'dice_parity' }]), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/casino/history?game=coin');
    expect((await GET(request, context)).status).toBe(503);
    upstream.mockImplementationOnce(async () => new Response('bad', { status: 200, headers: { 'content-type': 'text/plain' } }));
    expect((await GET(request, context)).status).toBe(503);
  });
});
