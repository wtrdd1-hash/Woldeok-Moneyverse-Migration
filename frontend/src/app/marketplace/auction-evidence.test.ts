import { describe, expect, it } from 'vitest';
import { parseVerifiedAuctions } from './auction-evidence';

const row = {
  id: '11111111-1111-4111-8111-111111111111', itemName: 'Verified item',
  sellerName: 'Verified seller', rarity: 'EPIC', currentBidWld: '8500.0000',
  startPriceWld: '5000.0000', bidCount: 2, endsAt: '2026-11-01 10:00:00+00',
  description: '',
};

describe('auction DB source evidence', () => {
  it('normalizes only integral numeric(20,4) amounts without Number rounding', () => {
    expect(parseVerifiedAuctions([row])?.[0]?.currentBidWld).toBe('8500');
    expect(parseVerifiedAuctions([{ ...row, currentBidWld: '8500.0001' }])).toBeNull();
  });
  it('rejects duplicates, invalid UUID, unsafe counts and incomplete rows', () => {
    expect(parseVerifiedAuctions([row, row])).toBeNull();
    expect(parseVerifiedAuctions([{ ...row, id: 'auc-1' }])).toBeNull();
    expect(parseVerifiedAuctions([{ ...row, bidCount: 1.5 }])).toBeNull();
    expect(parseVerifiedAuctions([{ ...row, sellerName: '' }])).toBeNull();
  });
  it('distinguishes an authenticated verified empty list from invalid data', () => {
    expect(parseVerifiedAuctions([])).toEqual([]);
    expect(parseVerifiedAuctions({ auctions: [] })).toBeNull();
  });
});
