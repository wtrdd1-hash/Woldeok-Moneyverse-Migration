import { beforeEach, describe, expect, it, vi } from 'vitest';

const { viewerOrUnknown } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));

import { GET, POST } from './route';

const request = (body: unknown) => new Request('https://example.test/api/spaces/real-estate/auction', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});

describe('landmark auction source-integrity hold', () => {
  beforeEach(() => { vi.resetAllMocks(); viewerOrUnknown.mockResolvedValue({ signedIn: true }); });

  it('never serves synthetic auctions or claimed ownership as verified', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(503);
    expect(data).toMatchObject({ ok: false, code: 'LANDMARK_AUCTION_SOURCE_UNVERIFIED' });
    expect(data).not.toHaveProperty('auctions');
    expect(data).not.toHaveProperty('totalUnclaimedRent');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('does not accept or persist a pretend bid even with an authenticated session', async () => {
    const response = await POST(request({ landmarkId: 'landmark-gn-prime', bidAmount: 900000 }));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ ok: false, code: 'LANDMARK_AUCTION_SOURCE_UNVERIFIED' });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('distinguishes signed-out users and unknown authentication', async () => {
    viewerOrUnknown.mockResolvedValueOnce({ signedIn: false }).mockResolvedValueOnce(null);
    expect((await POST(request({ landmarkId: 'x', bidAmount: 1 }))).status).toBe(401);
    expect((await POST(request({ landmarkId: 'x', bidAmount: 1 }))).status).toBe(503);
  });
});
