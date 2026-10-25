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

const ITEM = {
  catalog_id: '00000000-0000-4000-8000-000000000002',
  code: 'item_frame',
  name: '\u200B=SUM(1,2)\r\n',
  category: 'frame',
  quantity: 3,
  acquired_at: '2026-10-26T01:00:00.000Z',
  expires_at: null,
  rarity: 'rare',
  is_equipped: true,
  equipped_slot: 'frame',
  serial_number: 42,
  weekly_cost: '9007199254740993',
};

const request = (suffix = '') => new NextRequest('https://easy-scraping.com/api/shop/holdings/export' + suffix);

describe('private complete inventory CSV export', () => {
  beforeEach(() => vi.resetAllMocks());

  it('escapes formula and invisible controls, and returns private complete snapshot', async () => {
    apiMock.mockResolvedValue({ holdings: [ITEM], complete: true });
    const response = await GET(request());
    expect(apiMock).toHaveBeenCalledWith('/api/v1/shop/holdings/export-snapshot');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('content-type')).toContain('text/csv');
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([239, 187, 191]);
    const csv = new TextDecoder().decode(bytes);
    expect(csv).toContain("'=SUM(1,2)");
    expect(csv).not.toContain('\u200B');
    expect(csv).toContain('2026-10-26T01:00:00.000Z');
    expect(csv).toContain('9007199254740993');
    expect(csv.split('\r\n')).toHaveLength(2);
  });

  it('returns a header-only CSV for verified empty holdings', async () => {
    apiMock.mockResolvedValue({ holdings: [], complete: true });
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect((await response.text()).split('\r\n')).toHaveLength(1);
  });

  it.each(['?userId=foreign', '?limit=20', '?foo=1'])('rejects unauthorized query scope %s', async (query) => {
    expect((await GET(request(query))).status).toBe(400);
    expect(apiMock).not.toHaveBeenCalled();
  });

  it.each([401, 403, 428])('preserves auth refusal %s without an attachment', async (status) => {
    const { ApiError } = await import('@/lib/api');
    apiMock.mockRejectedValue(new ApiError(status));
    const response = await GET(request());
    expect(response.status).toBe(status);
    expect(response.headers.get('content-disposition')).toBeNull();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('fails closed on incomplete, oversized, malformed and unavailable snapshots', async () => {
    apiMock.mockResolvedValueOnce({ holdings: [ITEM], complete: false })
      .mockResolvedValueOnce({ holdings: Array.from({ length: 101 }, () => ITEM), complete: true })
      .mockResolvedValueOnce({ holdings: [{ ...ITEM, quantity: 1.5 }], complete: true })
      .mockResolvedValueOnce({ holdings: [{ ...ITEM, is_equipped: 'true' }], complete: true })
      .mockResolvedValueOnce({ holdings: [{ ...ITEM, acquired_at: 'yesterday' }], complete: true })
      .mockResolvedValueOnce({ holdings: [{ ...ITEM, weekly_cost: 9007199254740993 }], complete: true })
      .mockRejectedValueOnce(new Error('DB down'));
    for (let i = 0; i < 7; i++) {
      const response = await GET(request());
      expect(response.status).toBe(503);
      expect(response.headers.get('content-disposition')).toBeNull();
    }
  });
});
