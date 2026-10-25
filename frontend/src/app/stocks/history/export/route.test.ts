import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireMember = vi.fn();
const api = vi.fn();
vi.mock('@/lib/session', () => ({ requireMember }));
vi.mock('@/lib/api', () => ({ api }));

import { GET } from './route';

beforeEach(() => { vi.clearAllMocks(); });

describe('private verified stock history CSV', () => {
  it('checks member session before any trade lookup', async () => {
    requireMember.mockRejectedValueOnce(new Error('no session'));
    await expect(GET()).rejects.toThrow('no session');
    expect(api).not.toHaveBeenCalled();
  });
  it('returns an attachment with private no-store and noindex', async () => {
    api.mockResolvedValueOnce({ trades: [] });
    const response = await GET();
    expect(api).toHaveBeenCalledWith('/api/v1/stocks/history?limit=100');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain('Trade ID');
  });
  it('does not fabricate empty history on backend failure', async () => {
    api.mockRejectedValueOnce(new Error('backend down'));
    await expect(GET()).rejects.toThrow('backend down');
  });
});
