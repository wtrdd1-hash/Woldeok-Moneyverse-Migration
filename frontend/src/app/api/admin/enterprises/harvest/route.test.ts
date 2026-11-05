import { describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const apiMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', () => {
  class ApiError extends Error {
    status: number;
    code?: string;
    constructor(status: number, message: string, code?: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code;
    }
  }
  return {
    api: apiMock,
    ApiError,
  };
});

describe('SOE dividend remittance proxy', () => {
  it('forwards request to backend harvest endpoint and returns json result', async () => {
    apiMock.mockResolvedValueOnce({
      success: true,
      code: 'SOE_DIVIDEND_HARVESTED',
      total_dividends_collected: '108000',
      enterprises_processed: 3,
      treasury_balance_after: '191163911',
      ledger_transaction_id: 'tx-1234',
    });

    const response = await POST();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      code: 'SOE_DIVIDEND_HARVESTED',
      total_dividends_collected: '108000',
    });
    expect(apiMock).toHaveBeenCalledWith('/api/v1/admin/enterprises/soes/harvest', {
      method: 'POST',
    });
  });

  it('handles backend error gracefully with 500 when unknown error occurs', async () => {
    apiMock.mockRejectedValueOnce(new Error('Unknown connection issue'));

    const response = await POST();
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({
      code: 'SOE_DIVIDEND_HARVEST_FAILED',
      error: '공기업 배당 수취 처리에 실패했습니다.',
    });
  });
});
