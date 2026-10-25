import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
import { apiOrNull } from '@/lib/api';
import { GET } from './route';

const id = '11111111-1111-4111-8111-111111111111';
const request = (interval: string) => new Request(`https://example.test/api/stocks/${id}/candles?interval=${interval}`);
const context = { params: Promise.resolve({ id }) };

describe('stock candle gateway interval contract', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes the supported 30-minute interval to NestJS and disables private caching', async () => {
    vi.mocked(apiOrNull).mockResolvedValue({ interval: 1800, candles: [] });
    const result = await GET(request('1800'), context);
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(apiOrNull).toHaveBeenCalledWith(`/api/v1/stocks/${id}/candles?interval=1800`);
  });

  it('rejects unsupported 15-minute numeric intervals before querying the backend', async () => {
    const result = await GET(request('900'), context);
    expect(result.status).toBe(400);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(apiOrNull).not.toHaveBeenCalled();
  });

  it('rejects misleading 15m alias instead of passing a PostgreSQL-unsupported width', async () => {
    const result = await GET(request('15m'), context);
    expect(result.status).toBe(400);
    expect(apiOrNull).not.toHaveBeenCalled();
  });

  it('does not return a fake success payload when the NestJS API is unavailable', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(null);
    const result = await GET(request('1800'), context);
    expect(result.status).toBe(503);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
  });
});
