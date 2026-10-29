import { describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api, ApiError: class ApiError extends Error {} }));
import { POST } from './route';

describe('v1502 sovereign-fund liquidation BFF verified ledger integration', () => {
  it('forwards liquidation to backend authoritative endpoint', async () => {
    (api as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: true,
      message: '국고 국부펀드(ASWF) 과도한 주식 투자 자산의 국고 현금 회수 환원이 완료되었습니다.',
    });
    const response = await POST();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      message: '국고 국부펀드(ASWF) 과도한 주식 투자 자산의 국고 현금 회수 환원이 완료되었습니다.',
    });
    expect(api).toHaveBeenCalledWith('/api/v1/admin/treasury/swf/liquidate', {
      method: 'POST',
      body: {},
    });
  });
});
