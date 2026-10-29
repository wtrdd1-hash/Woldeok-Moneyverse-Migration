import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { mutate } from '@/lib/mutate';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate: vi.fn() }));

const post = (origin: string | null, site: string | null = 'same-origin') => {
  const headers: Record<string, string> = {};
  if (origin !== null) headers['origin'] = origin;
  if (site !== null) headers['sec-fetch-site'] = site;
  return new Request('https://easy-scraping.com/api/pension/toggle-retire', { method: 'POST', headers });
};

describe('Pension retirement browser gateway CSRF boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mutate).mockResolvedValue({ status: 'RETIRED_RECEIVING' });
  });

  it('rejects cross-origin and missing-origin POST before any upstream request', async () => {
    for (const req of [post('https://evil.example'), post(null), post('https://easy-scraping.com', 'cross-site')]) {
      expect((await POST(req)).status).toBe(403);
    }
    expect(mutate).not.toHaveBeenCalled();
    expect(api).not.toHaveBeenCalled();
  });

  it('uses the server-side session CSRF mutation path for same-origin POST', async () => {
    const response = await POST(post('https://easy-scraping.com'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'RETIRED_RECEIVING' });
    expect(mutate).toHaveBeenCalledWith('/api/v1/pension/toggle-retire', { method: 'POST' });
    expect(api).not.toHaveBeenCalled();
  });
});
