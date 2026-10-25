import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number) { super('refused'); }
  },
}));
import { GET } from './route';

const RECEIPT = {
  receipt_id: '00000000-0000-4000-8000-000000000001',
  assignment_id: '00000000-0000-4000-8000-000000000002',
  code: 'task-1', name: '\u200b=SUM(1,2)\r\nprivate',
  reward_amount: '9007199254740993', experience_amount: '0',
  transaction_id: '00000000-0000-4000-8000-000000000003',
  created_at: '2026-10-26T00:00:00.000Z',
};
const req = (query = '') => new NextRequest(`https://easy-scraping.com/api/work/receipts/export${query}`);

describe('recent work receipts private CSV', () => {
  beforeEach(() => vi.resetAllMocks());
  it('exports exact integer strings, neutralizes formulas and labels references as unverified', async () => {
    apiMock.mockResolvedValue({ scope: 'recent_20', limit: 20, receipts: [RECEIPT] });
    const response = await GET(req());
    expect(apiMock).toHaveBeenCalledWith('/api/v1/work/receipts/export');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment;');
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([239, 187, 191]);
    const csv = new TextDecoder().decode(bytes);
    expect(csv).toContain('9007199254740993');
    expect(csv).toContain("'=SUM(1,2) private");
    expect(csv).toContain('reference_present_unverified');
    expect(csv).not.toContain('\u200b');
  });
  it('allows zero-WLD receipts without pretending a ledger transaction exists', async () => {
    apiMock.mockResolvedValue({ scope: 'recent_20', limit: 20, receipts: [{ ...RECEIPT, reward_amount: '0', transaction_id: null }] });
    const response = await GET(req());
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('no_transaction_recorded');
  });
  it.each(['?limit=100', '?actor=someone', '?limit=20&limit=20'])('rejects unexpected query %s', async (query) => {
    expect((await GET(req(query))).status).toBe(400);
    expect(apiMock).not.toHaveBeenCalled();
  });
  it.each([401, 403, 428])('preserves auth/consent refusal %i', async (status) => {
    const { ApiError } = await import('@/lib/api');
    apiMock.mockRejectedValue(new ApiError(status));
    const response = await GET(req());
    expect(response.status).toBe(status);
    expect(response.headers.get('content-disposition')).toBeNull();
  });
  it('rejects wrong scope, more than 20 rows, invalid money and broken transport rather than a false CSV', async () => {
    apiMock.mockResolvedValueOnce({ scope: 'all', limit: 20, receipts: [] })
      .mockResolvedValueOnce({ scope: 'recent_20', limit: 20, receipts: Array.from({ length: 21 }, () => RECEIPT) })
      .mockResolvedValueOnce({ scope: 'recent_20', limit: 20, receipts: [{ ...RECEIPT, reward_amount: Number('9007199254740993') }] })
      .mockRejectedValueOnce(new Error('db unavailable'));
    for (let i = 0; i < 4; i += 1) expect((await GET(req())).status).toBe(503);
  });
});
