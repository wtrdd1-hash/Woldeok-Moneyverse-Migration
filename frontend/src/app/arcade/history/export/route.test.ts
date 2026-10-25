import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from '@/lib/api';
import { GET } from './route';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(readonly status: number) { super('unavailable'); }
  },
}));

const record = {
  play_id: '00000000-0000-4000-8000-000000000001',
  game: 'coin',
  choice: 'heads',
  outcome: 'heads',
  stake_amount: '9007199254740993',
  net_amount: '-9007199254740993',
  transaction_id: '00000000-0000-4000-8000-000000000002',
  played_at: '2026-10-25T10:00:00.000Z',
};

beforeEach(() => vi.resetAllMocks());

describe('private recorded coin/dice CSV export', () => {
  it('exports the member-scoped 100-play read model as no-store attachment with precise strings', async () => {
    vi.mocked(api).mockResolvedValue([record]);
    const response = await GET();
    expect(api).toHaveBeenCalledWith('/api/v1/casino/history?limit=100');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('content-disposition')).toContain('attachment;');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    const csv = await response.text();
    expect(csv).toContain("'9007199254740993");
    expect(csv).toContain("'-9007199254740993");
    expect(csv).toContain(record.transaction_id);
  });

  it('neutralizes spreadsheet formulas and line breaks in server text', async () => {
    vi.mocked(api).mockResolvedValue([{ ...record, choice: '=HYPERLINK("bad")', outcome: '+bad\r\nnext' }]);
    const response = await GET();
    expect(response.status).toBe(200);
    const csv = await response.text();
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'+bad next");
    expect(csv).not.toContain('+bad\r\nnext');
  });

  it('never creates a blank or partial CSV on backend failure', async () => {
    vi.mocked(api).mockRejectedValue(new Error('offline'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('content-disposition')).toBeNull();
  });

  it('preserves authentication refusal without a downloadable file', async () => {
    vi.mocked(api).mockRejectedValue(new ApiError(401));
    expect((await GET()).status).toBe(401);
  });

  it.each([
    [{ ...record, stake_amount: 9007199254740993 }],
    [{ ...record, transaction_id: null }],
    [{ ...record, played_at: 'invalid' }],
    Array.from({ length: 101 }, () => record),
  ])('refuses malformed or unbounded upstream history', async (value) => {
    vi.mocked(api).mockResolvedValue(value);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('content-disposition')).toBeNull();
  });
});
