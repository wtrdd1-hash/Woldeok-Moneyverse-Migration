import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, TestApiError } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  TestApiError: class extends Error { constructor(readonly status: number) { super(`HTTP ${status}`); } },
}));
vi.mock('@/lib/api', () => ({
  api: (...args: unknown[]) => apiMock(...args),
  ApiError: TestApiError,
}));
import { GET } from './route';

const sample = {
  alert_id: '00000000-0000-4000-8000-000000000001', stock_id: '00000000-0000-4000-8000-000000000002',
  symbol: 'WLD', name: 'Private', condition_kind: 'price_at_or_above',
  threshold_amount: '9007199254740993', threshold_bps: null, cooldown_seconds: 3600,
  current_price: '9007199254740995', day_open_price: '9007199254740991',
  current_day_change_bps: 5, condition_met: true,
  last_evaluated_at: null, last_triggered_at: null, created_at: '2026-10-26T00:00:00.000Z',
};

beforeEach(() => apiMock.mockReset());

describe('private stock alert rules CSV download', () => {
  it('forwards only caller session through internal API and never caches a CSV', async () => {
    apiMock.mockResolvedValue({ rules: [sample], limit: 100 });
    const response = await GET();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/stocks/alerts/rules-export', { timeoutMs: 12000 });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain('9007199254740993');
  });

  it('fails closed on an overflow or malformed API response without leaking a partial CSV', async () => {
    apiMock.mockResolvedValue({ rules: Array.from({ length: 101 }, () => sample), limit: 100 });
    const overflow = await GET();
    expect(overflow.status).toBe(503);
    expect(overflow.headers.get('content-type')).not.toContain('text/csv');
    apiMock.mockResolvedValue({ rules: [sample], limit: 20 });
    expect((await GET()).status).toBe(503);
  });

  it('preserves authentication and consent failure status without a private file', async () => {
    for (const status of [401, 403, 409, 428]) {
      apiMock.mockRejectedValueOnce(new TestApiError(status));
      const response = await GET();
      expect(response.status).toBe(status);
      expect(response.headers.get('cache-control')).toContain('no-store');
    }
  });
});
