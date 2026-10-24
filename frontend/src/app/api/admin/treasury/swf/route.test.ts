import { describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api,
  ApiError: class ApiError extends Error { constructor(public status: number) { super('api'); } },
}));
import { GET, POST, PUT } from './route';

describe('P0 SWF proxy financial mutation containment', () => {
  it('holds rebalance without forwarding any request', async () => {
    api.mockReset();
    const response = await POST();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(api).not.toHaveBeenCalled();
  });
  it('holds config mutation without forwarding any request', async () => {
    api.mockReset();
    const response = await PUT(new Request('https://easy-scraping.com/api/admin/treasury/swf', {
      method: 'PUT',
      headers: { origin: 'https://easy-scraping.com', 'sec-fetch-site': 'same-origin' },
      body: JSON.stringify({ is_enabled: true }),
    }));
    expect(response.status).toBe(503);
    expect(api).not.toHaveBeenCalled();
  });
  it('preserves read-only status GET', async () => {
    api.mockReset();
    api.mockResolvedValueOnce({ portfolios: [], events: [], config: null });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(api).toHaveBeenCalledWith('/api/v1/admin/treasury/swf');
  });
});
