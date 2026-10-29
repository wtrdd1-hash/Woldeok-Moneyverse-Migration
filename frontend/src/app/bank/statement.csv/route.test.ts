import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, memberMock } = vi.hoisted(() => ({ apiMock: vi.fn(), memberMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: memberMock }));

import { GET } from './route';

const snapshot = {
  currency: 'WLD', cashBalance: '900719925474099312345678',
  depositBalance: '12', unclaimedInterest: '0', activeLoanOutstanding: null,
  observedAt: '2026-10-28T07:00:00.000Z', readOnly: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  memberMock.mockResolvedValue(undefined);
  apiMock.mockResolvedValue(snapshot);
});

describe('authenticated bank statement CSV download', () => {
  it('uses the internal authenticated bank API and disables caching and indexing', async () => {
    const response = await GET();
    expect(memberMock).toHaveBeenCalledOnce();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/banking/standing/snapshot');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(await response.text()).toContain('cash_balance,900719925474099312345678');
  });

  it('never fetches the statement without the member session gate', async () => {
    memberMock.mockRejectedValueOnce(new Error('member required'));
    await expect(GET()).rejects.toThrow('member required');
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('returns a private failure, not a fabricated balance, when the backend is unavailable', async () => {
    apiMock.mockRejectedValueOnce(new Error('backend offline'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(await response.text()).not.toContain('cash_balance');
  });
});
