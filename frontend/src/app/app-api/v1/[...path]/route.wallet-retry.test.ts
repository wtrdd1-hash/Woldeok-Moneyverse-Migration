import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const KEY = '11111111-1111-4111-8111-111111111111';
const AMOUNT = '99999999999999999999999999999999999999';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Android app-api financial retry contract', () => {
  it('preserves request UUID and WLD precision across the backend proxy', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://example.test');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const payload = { direction: 'deposit', amount: AMOUNT, idempotencyKey: KEY };
    const fetchSpy = vi.fn(async (_target: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(JSON.parse(new TextDecoder().decode(init?.body as ArrayBuffer))).toEqual(payload);
      return new Response(JSON.stringify({ transactionId: KEY }), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest('https://example.test/app-api/v1/bank/movements', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
    });
    const response = await POST(request, { params: Promise.resolve({ path: ['bank', 'movements'] }) });
    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(await response.json()).toMatchObject({ transactionId: KEY });
  });
});
