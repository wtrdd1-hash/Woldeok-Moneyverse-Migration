// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { POST as subscribe } from '@/app/api/stocks/league/copy-trade/subscribe/route';
import { POST as cancel } from '@/app/api/stocks/league/copy-trade/cancel/route';

describe('unverified copy-trading mutation gateway', () => {
  it('refuses subscription before touching backend or DB', async () => {
    const response = await subscribe();
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toMatchObject({ error: expect.any(String) });
  });
  it('refuses cancellation rather than falsely confirming cancellation', async () => {
    const response = await cancel();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: expect.any(String) });
  });
});
