import { beforeEach, describe, expect, it, vi } from 'vitest';

const { isLoggedInMember } = vi.hoisted(() => ({ isLoggedInMember: vi.fn() }));
vi.mock('@/lib/session', () => ({ isLoggedInMember }));
import { POST } from '../api/advisor/deoki/rebalance/execute/route';

function request(origin = 'http://localhost:3000'): Request {
  return new Request('http://localhost:3000/api/advisor/deoki/rebalance/execute', {
    method: 'POST', headers: { 'Content-Type': 'application/json', origin, 'sec-fetch-site': origin === 'http://localhost:3000' ? 'same-origin' : 'cross-site' },
    body: JSON.stringify({ targetStocksRatio: 55, targetBondsRatio: 20, targetCashRatio: 25 }),
  });
}

function assertPrivate(response: Response) {
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toContain('noindex');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
}

describe('advisor rebalance must not forge execution receipts', () => {
  beforeEach(() => isLoggedInMember.mockReset());

  it('rejects cross-origin requests before reading the member session', async () => {
    const response = await POST(request('https://attacker.example'));
    expect(response.status).toBe(403);
    expect(isLoggedInMember).not.toHaveBeenCalled();
    assertPrivate(response);
  });

  it('rejects unauthenticated requests without a simulated receipt', async () => {
    isLoggedInMember.mockResolvedValueOnce(false);
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(await response.text()).not.toMatch(/SIMULATED_FILLED|executionId|1200000|success":true/);
    assertPrivate(response);
  });

  it('fails closed for authenticated members until ledger-backed settlement exists', async () => {
    isLoggedInMember.mockResolvedValueOnce(true);
    const response = await POST(request());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: 'ADVISOR_REBALANCE_UNVERIFIED' });
    assertPrivate(response);
  });
});
