import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const KEY = '44444444-4444-4444-8444-444444444444';
const TX = '55555555-5555-4555-8555-555555555555';
const TO = '22222222-2222-4222-8222-222222222222';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android owner transfer receipt privacy and source-truth boundary', () => {
  it.each([
    [{ status: 'unknown' }, 200],
    [{ status: 'committed', transactionId: TX, recipientUserId: TO, amount: '9007199254740993' }, 200],
    [{ status: 'committed', transactionId: TX, recipientUserId: TO, amount: '1.5' }, 503],
    [{ status: 'unknown', transactionId: TX }, 503],
  ])('enforces private headers and verified receipt shape: %s', async (payload, expected) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await GET(new NextRequest(`https://easy-scraping.com/app-api/v1/wallet/transfers/receipts/${KEY}`), {
      params: Promise.resolve({ path: ['wallet', 'transfers', 'receipts', KEY] }),
    });
    expect(response.status).toBe(expected);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    if (expected === 503) expect(JSON.stringify(await response.json())).not.toContain(TX);
  });
});
