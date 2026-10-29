import { describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, apiOrNull } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), apiOrNull: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
import { GET } from './route';

describe('wallet recipient discovery privacy', () => {
  it.each(['alice', '%', '_', ''])('never exposes member profile matches for query %s', async (query) => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    const response = await GET(new Request(`http://localhost/api/transfers/search?query=${encodeURIComponent(query)}`));
    expect(response.status).toBe(410);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(apiOrNull).not.toHaveBeenCalled();
  });
});
