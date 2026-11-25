import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
import { POST } from './route';


const sameOrigin = (path = '/api/test') => new Request(`http://localhost${path}`, { method: 'POST', headers: { origin: 'http://localhost', 'content-type': 'application/json' }, body: '{}' });

describe('reward claim is not a notification read', () => {
  beforeEach(() => vi.resetAllMocks());
  it('never returns success or a claimed reward count', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    const response = await POST(sameOrigin());
    expect(response.status).toBe(409);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).not.toHaveProperty('claimedCount');
  });
  it('distinguishes signed-out and unavailable authentication', async () => {
    viewerOrUnknown.mockResolvedValueOnce({ signedIn: false }).mockResolvedValueOnce(null);
    expect((await POST(sameOrigin())).status).toBe(401);
    expect((await POST(sameOrigin())).status).toBe(503);
  });
});
