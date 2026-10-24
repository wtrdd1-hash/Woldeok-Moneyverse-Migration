import { describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api,
  ApiError: class ApiError extends Error { constructor(public status: number) { super('api'); } },
}));
import { POST } from './route';

describe('P0 SWF liquidation containment', () => {
  it('never forwards liquidation to an unverified ledger mutation', async () => {
    api.mockReset();
    const response = await POST(new Request('https://easy-scraping.com/api/admin/treasury/swf/liquidate', {
      method: 'POST',
      headers: { origin: 'https://easy-scraping.com', 'sec-fetch-site': 'same-origin' },
      body: JSON.stringify({ targetPortfolioAumWld: '20000000' }),
    }));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(api).not.toHaveBeenCalled();
  });
});
