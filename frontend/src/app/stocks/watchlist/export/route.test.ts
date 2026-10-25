import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from '@/lib/api';
import { GET } from './route';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error { constructor(readonly status: number) { super('upstream error'); } },
}));

const row = {
  stock_id: '22222222-2222-4222-8222-222222222222', symbol: 'WLD',
  name: '=HYPERLINK("bad")', current_price: '9007199254740993',
  day_open_price: '9007199254740992', created_at: '2026-10-26T00:00:00.000Z',
};

beforeEach(() => vi.clearAllMocks());

describe('private watchlist CSV export', () => {
  it('streams only verified columns, escapes formula text and retains exact bigint strings', async () => {
    vi.mocked(api).mockResolvedValue({ stocks: [row] });
    const response = await GET();
    const bytes = new Uint8Array(await response.arrayBuffer());
    const body = new TextDecoder().decode(bytes);
    expect(api).toHaveBeenCalledWith('/api/v1/stocks/watchlist/export');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(body).toContain('9007199254740993');
    expect(body).toContain("'=HYPERLINK");
    expect(body).toMatch(/^stock_id,symbol,name,current_price_wld,day_open_price_wld,saved_at/);
    expect(Array.from(bytes.slice(0, 3))).toEqual([239, 187, 191]);
  });

  it('refuses malformed or incomplete upstream snapshots rather than returning a success CSV', async () => {
    vi.mocked(api).mockResolvedValue({ stocks: [row, { ...row, current_price: '1e+25' }] });
    expect((await GET()).status).toBe(503);
    vi.mocked(api).mockResolvedValue({ stocks: Array.from({ length: 101 }, () => row) });
    expect((await GET()).status).toBe(503);
  });

  it('preserves authorization failures without disclosing member data', async () => {
    vi.mocked(api).mockRejectedValue(new ApiError(401));
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.text()).not.toContain('9007199254740993');
  });
});
