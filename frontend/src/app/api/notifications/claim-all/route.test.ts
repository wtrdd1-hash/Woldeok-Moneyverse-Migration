import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
import { POST } from './route';

describe('reward claim is not a notification read', () => {
  beforeEach(() => vi.resetAllMocks());
  it('never returns success or a claimed reward count', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    const response = await POST();
    expect(response.status).toBe(409);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).not.toHaveProperty('claimedCount');
  });
  it('distinguishes signed-out and unavailable authentication', async () => {
    viewerOrUnknown.mockResolvedValueOnce({ signedIn: false }).mockResolvedValueOnce(null);
    expect((await POST()).status).toBe(401);
    expect((await POST()).status).toBe(503);
  });
});
