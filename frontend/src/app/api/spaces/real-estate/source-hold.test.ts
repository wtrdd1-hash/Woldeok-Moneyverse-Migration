// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { GET as getAuctions, POST as postBid } from './auction/route';
import { POST as claimRent } from './claim-rent/route';

vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: vi.fn().mockResolvedValue({ signedIn: true }) }));

async function expectHold(response: Response, code: string) {
  expect(response.status).toBe(503);
  expect(response.headers.get('cache-control')).toContain('no-store');
  expect(response.headers.get('x-robots-tag')).toContain('noindex');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  const body = await response.json();
  expect(body).toMatchObject({ ok: false, code });
  expect(body).not.toHaveProperty('claimedAmount');
  expect(body).not.toHaveProperty('auctions');
  expect(body).not.toHaveProperty('receipt');
}

describe('P0 real estate Next edge must not invent WLD bids or dividends', () => {
  it('does not expose synthetic member shares, auction prices or rent', async () => {
    await expectHold(await getAuctions(), 'REAL_ESTATE_SOURCE_UNVERIFIED');
  });

  it('does not accept an in-memory bid as a real financial transaction', async () => {
    const req = new Request('https://example.test/api/spaces/real-estate/auction', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ landmarkId: 'landmark-gn-prime', bidAmount: 990000 }),
    });
    await expectHold(await postBid(req), 'REAL_ESTATE_LEDGER_UNAVAILABLE');
  });

  it('does not claim a fixed WLD rent payout', async () => {
    await expectHold(await claimRent(), 'REAL_ESTATE_LEDGER_UNAVAILABLE');
  });
});
