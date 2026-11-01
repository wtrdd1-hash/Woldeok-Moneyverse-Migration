import { describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
const ID = '00000000-0000-4000-8000-000000000001';
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe('stock orderbook HTTP source contract', () => {
  it('rejects a malformed identifier before reaching Nest', async () => {
    const response = await GET(new Request('http://localhost/api/stocks/no/orderbook'), ctx('not-a-uuid'));
    expect(response.status).toBe(400);
    expect(api).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('preserves an unavailable source as 503 with private noindex headers', async () => {
    vi.mocked(api).mockRejectedValueOnce(new Error('upstream unavailable'));
    const response = await GET(new Request(`http://localhost/api/stocks/${ID}/orderbook`), ctx(ID));
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('stock_orderbook_source_unverified');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(api).toHaveBeenCalledWith(`/api/v1/stocks/${ID}/orderbook`, { timeoutMs: 3000 });
  });

  it('fails closed if an older backend responds with an unverified 200 payload', async () => {
    vi.mocked(api).mockResolvedValueOnce({ asks: [{ price: '100', quantity: 900 }] });
    const response = await GET(new Request(`http://localhost/api/stocks/${ID}/orderbook`), ctx(ID));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('900');
  });
});
