import { describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({
  api: vi.fn(),
}));

vi.mock('@/lib/api', () => {
  class ApiError extends Error {
    constructor(public readonly status: number, message?: string) {
      super(message || 'API error');
    }
  }
  return { api, ApiError };
});

import { POST } from './route';

describe('bond coupon Next gateway', () => {
  it('dispatches manual coupon settlement and returns 200 on success', async () => {
    api.mockResolvedValueOnce({ ok: true, distributedCoupons: 5 });
    const response = await POST();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ ok: true, distributedCoupons: 5 });
  });

  it('handles ApiError correctly and passes through status code', async () => {
    const { ApiError } = await import('@/lib/api');
    api.mockRejectedValueOnce(new ApiError(403, '권한이 없습니다.'));
    const response = await POST();
    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe('권한이 없습니다.');
  });
});
