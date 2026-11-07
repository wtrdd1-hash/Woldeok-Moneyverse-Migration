// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));

import { GET } from './route';

describe('league BFF private HTTP response', () => {
  beforeEach(() => { api.mockReset(); });
  it('sets private no-store/noindex/no-referrer on authenticated response', async () => {
    api.mockResolvedValue({ success: true, season: null, whales: [], leaderboard: [] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect((await response.json()).season).toBeNull();
  });
  it('keeps failure private and does not invent success', async () => {
    api.mockRejectedValue({ status: 503, message: 'private backend detail' });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(await response.text()).not.toContain('private backend detail');
  });
});
