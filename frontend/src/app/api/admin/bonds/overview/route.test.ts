import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) { super(message); }
  },
}));

import { ApiError } from '@/lib/api';
import { GET } from './route';

const overview = {
  totalBondsActive: 0, totalFundedWld: '0', totalHoldersCount: 0,
  totalCouponsPaidWld: '0', benchmark1YYield: '—', benchmark3YYield: '—', benchmark5YYield: '—',
};

function assertPrivate(response: Response) {
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
}

describe('administrator bond evidence proxy confidentiality', () => {
  beforeEach(() => vi.resetAllMocks());

  it('only serves verified backend evidence with private response headers', async () => {
    apiMock.mockResolvedValueOnce(overview).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const response = await GET();
    expect(response.status).toBe(200);
    assertPrivate(response);
    expect((await response.json()).overview.totalBondsActive).toBe(0);
    expect(apiMock).toHaveBeenCalledTimes(3);
  });

  it.each([401, 403])('preserves backend auth refusal %i without exposing upstream detail', async (status) => {
    apiMock.mockRejectedValueOnce(new ApiError(status, 'sensitive internal SQL session context'));
    const response = await GET();
    expect(response.status).toBe(status);
    assertPrivate(response);
    expect(JSON.stringify(await response.json())).not.toMatch(/sensitive|SQL|session context/i);
  });

  it('does not reflect unexpected upstream statuses or database errors', async () => {
    apiMock.mockRejectedValueOnce(Object.assign(new Error('permission denied for table secret'), { status: 418 }));
    const response = await GET();
    expect(response.status).toBe(503);
    assertPrivate(response);
    expect(JSON.stringify(await response.json())).not.toMatch(/permission|table secret|418/);
  });

  it('does not return a false success on malformed financial evidence', async () => {
    apiMock.mockResolvedValueOnce({ totalBondsActive: 9 }).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    const response = await GET();
    expect(response.status).toBe(503);
    assertPrivate(response);
    expect((await response.json()).overview).toBeUndefined();
  });
});
