// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { GET, POST as bid } from './route';
import { POST as claim } from '../claim-rent/route';

vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: vi.fn().mockResolvedValue({ signedIn: true }) }));

describe('unverified virtual land auction release hold', () => {
  it('does not publish invented owner shares, rent or auctions', async () => {
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toContain('no-store');
    const payload = await res.json();
    expect(payload.ok).toBe(false);
    expect(payload).not.toHaveProperty('auctions');
    expect(payload).not.toHaveProperty('totalUnclaimedRent');
  });

  it('never accepts bids without an authoritative PostgreSQL/ledger receipt', async () => {
    const res = await bid(new Request('https://example.test/api/spaces/real-estate/auction', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ landmarkId: 'unknown', bidAmount: 999999 }),
    }));
    expect(res.status).toBe(503);
    expect((await res.json()).ok).toBe(false);
  });

  it('never returns a fictitious 4,990 WLD rent payout', async () => {
    const res = await claim();
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toContain('no-store');
    const payload = await res.json();
    expect(payload.ok).toBe(false);
    expect(payload).not.toHaveProperty('claimedAmount');
  });
});
