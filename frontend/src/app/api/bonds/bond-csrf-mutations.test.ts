import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, mutate } = vi.hoisted(() => ({
  api: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/mutate', () => ({ mutate }));

import { POST as subscribe } from './subscribe/route';
import { POST as borrow } from './repo-loans/borrow/route';
import { POST as repay } from './repo-loans/repay/route';
import { PUT as rollover } from './rollover/route';

const holdingId = '7c72eac7-5f28-4c9e-b7e3-f0e2ac5a623c';
const flows = [
  { label: 'subscribe', method: 'POST', route: '/api/bonds/subscribe', backend: '/api/v1/bonds/subscribe', body: { bondId: holdingId, units: 1 }, handler: subscribe },
  { label: 'repo borrow', method: 'POST', route: '/api/bonds/repo-loans/borrow', backend: '/api/v1/bonds/repo-loans/borrow', body: { holdingId }, handler: borrow },
  { label: 'repo repay', method: 'POST', route: '/api/bonds/repo-loans/repay', backend: '/api/v1/bonds/repo-loans/repay', body: { loanId: holdingId }, handler: repay },
  { label: 'rollover', method: 'PUT', route: '/api/bonds/rollover', backend: `/api/v1/bonds/holdings/${holdingId}/rollover`, body: { holdingId, enabled: true }, handler: rollover },
] as const;

function request(
  flow: (typeof flows)[number],
  origin: string | null = 'https://easy-scraping.com',
  site = 'same-origin',
): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json', 'sec-fetch-site': site };
  if (origin !== null) headers.origin = origin;
  return new Request(`https://easy-scraping.com${flow.route}`, {
    method: flow.method,
    headers,
    body: JSON.stringify(flow.body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe.each(flows)('$label authenticated bond write gateway', (flow) => {
  it('passes a same-origin write through the server-side CSRF mutation helper', async () => {
    const receipt = { success: true };
    mutate.mockResolvedValueOnce(receipt);
    const response = await flow.handler(request(flow));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(receipt);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(mutate).toHaveBeenCalledExactlyOnceWith(flow.backend, {
      method: flow.method,
      body: flow.label === 'rollover' ? { enabled: true } : flow.body,
    });
    expect(api).not.toHaveBeenCalled();
  });

  it.each([
    ['missing origin', null, 'same-origin'],
    ['forged origin', 'https://attacker.example', 'cross-site'],
    ['cross-site fetch', 'https://easy-scraping.com', 'cross-site'],
  ])('rejects %s before any session CSRF token is minted', async (_label, origin, site) => {
    const response = await flow.handler(request(flow, origin, site));
    expect(response.status).toBe(403);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mutate).not.toHaveBeenCalled();
    expect(api).not.toHaveBeenCalled();
  });

  it('preserves backend financial error status for members', async () => {
    mutate.mockRejectedValueOnce(Object.assign(new Error('insufficient funds'), { status: 409 }));
    const response = await flow.handler(request(flow));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'insufficient funds' });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
