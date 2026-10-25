import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number) { super('API refused'); }
  },
}));
import { GET } from './route';

const PURCHASE = {
  purchaseId: '00000000-0000-4000-8000-000000000001',
  itemId: '00000000-0000-4000-8000-000000000002',
  transactionId: '00000000-0000-4000-8000-000000000003',
  itemName: '  =1+2\r\n',
  amount: '900719925474099312345678901',
  purchasedAt: '2026-10-25T10:00:00.000Z',
};

function request(query = '') {
  return new NextRequest(`https://easy-scraping.com/api/shop/purchases/export${query}`);
}

describe('private shop purchases CSV export', () => {
  beforeEach(() => vi.resetAllMocks());

  it('exports only backend owner receipts with exact WLD and injection-safe CSV', async () => {
    apiMock.mockResolvedValue({ purchases: [PURCHASE] });
    const response = await GET(request());
    expect(apiMock).toHaveBeenCalledWith('/api/v1/shop/purchases?limit=100');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toContain('attachment;');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([239, 187, 191]);
    const csv = new TextDecoder().decode(bytes);
    expect(csv).toContain('900719925474099312345678901');
    expect(csv).toContain("'=1+2");
    expect(csv.split('\r\n')).toHaveLength(2);
  });

  it('supports a smaller strict limit and a genuinely empty owner history', async () => {
    apiMock.mockResolvedValue({ purchases: [] });
    const response = await GET(request('?limit=20'));
    expect(response.status).toBe(200);
    expect(apiMock).toHaveBeenCalledWith('/api/v1/shop/purchases?limit=20');
    expect((await response.text()).split('\r\n')).toHaveLength(1);
  });

  it.each(['?limit=0', '?limit=101', '?limit=01', '?limit=2.5', '?limit=1e2', '?limit=20&limit=30'])(
    'refuses invalid limit %s without querying the API', async (query) => {
      const response = await GET(request(query));
      expect(response.status).toBe(400);
      expect(apiMock).not.toHaveBeenCalled();
    },
  );

  it.each([401, 403, 428])('preserves guarded API refusal %s without CSV bytes', async (status) => {
    const { ApiError } = await import('@/lib/api');
    apiMock.mockRejectedValue(new ApiError(status));
    const response = await GET(request());
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('content-disposition')).toBeNull();
  });

  it('never turns a failed API call or malformed receipt into an empty successful export', async () => {
    apiMock.mockRejectedValueOnce(new Error('connection down'))
      .mockResolvedValueOnce({ purchases: [{ ...PURCHASE, amount: 1.5 }] });
    expect((await GET(request())).status).toBe(503);
    expect((await GET(request())).status).toBe(503);
  });
});
