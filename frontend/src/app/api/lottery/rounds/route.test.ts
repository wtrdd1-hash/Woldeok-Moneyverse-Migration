import { describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));

describe('public lottery rounds BFF', () => {
  it('returns confirmed round data with no-store', async () => {
    vi.mocked(api).mockResolvedValueOnce({ rounds: [] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toEqual({ rounds: [] });
  });

  it('returns 503, not fabricated history, when backend is unavailable', async () => {
    vi.mocked(api).mockRejectedValueOnce(new Error('offline'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'lottery_rounds_unavailable' });
  });
});
