import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));

import { GET } from './route';
import { POST } from './copy-trade/subscribe/route';

describe('stock league HTTP source and ledger hold', () => {
  beforeEach(() => vi.resetAllMocks());

  it('preserves private member HTTP headers on successful read', async () => {
    apiMock.mockResolvedValueOnce({ success: true, season: null, leaderboard: [], whales: [], mySubscriptions: [] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('does not convert upstream error or invalid envelope into an empty season', async () => {
    apiMock.mockRejectedValueOnce(new Error('database unavailable'));
    const error = await GET();
    expect(error.status).toBe(503);
    expect(error.headers.get('cache-control')).toContain('no-store');
    apiMock.mockResolvedValueOnce({ success: false, season: null, leaderboard: [] });
    expect((await GET()).status).toBe(503);
    apiMock.mockResolvedValueOnce({ success: true, season: {}, leaderboard: [] });
    expect((await GET()).status).toBe(503);
  });

  it('never forwards a copy-trading write or claims subscription success', async () => {
    const response = await POST();
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('COPY_TRADING_LEDGER_UNAVAILABLE');
    expect(apiMock).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
