import { beforeEach, describe, expect, it, vi } from 'vitest';

const { viewerOrUnknown } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));

import { POST } from './route';

describe('landmark rent payout source-integrity hold', () => {
  beforeEach(() => { vi.resetAllMocks(); viewerOrUnknown.mockResolvedValue({ signedIn: true }); });

  it('never reports an unledgered rent payout as successful', async () => {
    const response = await POST();
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body).toMatchObject({ ok: false, code: 'LANDMARK_RENT_LEDGER_UNVERIFIED' });
    expect(body).not.toHaveProperty('claimedAmount');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('does not confuse a signed-out session with unknown authentication', async () => {
    viewerOrUnknown.mockResolvedValueOnce({ signedIn: false }).mockResolvedValueOnce(null);
    expect((await POST()).status).toBe(401);
    expect((await POST()).status).toBe(503);
  });
});
