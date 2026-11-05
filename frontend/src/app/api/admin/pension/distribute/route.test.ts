import { describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/api', () => {
  class ApiError extends Error {
    constructor(public status: number, message: string, public code?: string) {
      super(message);
    }
  }
  return {
    api: vi.fn(),
    ApiError,
  };
});

describe('POST /api/admin/pension/distribute', () => {
  it('forwards payout execution to backend canonical endpoint and returns 200', async () => {
    const { api } = await import('@/lib/api');
    vi.mocked(api).mockResolvedValueOnce({
      success: true,
      code: 'PENSION_PAYOUT_DISTRIBUTED',
      payouts_count: 0,
      total_payout_wld: '0',
    });

    const response = await POST();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(api).toHaveBeenCalledWith('/api/v1/admin/pension/distribute-payouts', { method: 'POST' });
  });

  it('handles backend ApiError gracefully with correct status', async () => {
    const { api, ApiError } = await import('@/lib/api');
    vi.mocked(api).mockRejectedValueOnce(new ApiError(403, '권한이 없습니다.'));

    const response = await POST();
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('권한이 없습니다.');
  });
});
