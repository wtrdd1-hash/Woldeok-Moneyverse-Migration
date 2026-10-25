import { describe, expect, it } from 'vitest';
import { formatAuctionWld, parseAuctionListings } from './auction-feed';
import { realAuction } from './auction-feed.fixture';



describe('verified auction read model', () => {
  it('accepts empty lists without fabricating starter items', () => {
    expect(parseAuctionListings([])).toEqual([]);
  });
  it('retains exact bigint WLD strings from valid server records', () => {
    expect(parseAuctionListings([realAuction])[0]?.currentBidWld).toBe('9007199254740994');
  });
  it('preserves PostgreSQL numeric(20,4) fractional WLD exactly without JS number rounding', () => {
    const row = parseAuctionListings([{ ...realAuction, startPriceWld: '8500.0000', currentBidWld: '9000.1250' }])[0];
    expect(row?.currentBidWld).toBe('9000.1250');
    expect(formatAuctionWld(row?.currentBidWld ?? '')).toBe('9,000.1250');
    expect(formatAuctionWld('9007199254740994.0000')).toBe('9,007,199,254,740,994');
    expect(() => parseAuctionListings([{ ...realAuction, currentBidWld: '9000.12345' }])).toThrow();
  });
  it('rejects synthetic ids and invalid money/date/row shape rather than displaying them', () => {
    expect(() => parseAuctionListings([{ ...realAuction, id: 'auc_01' }])).toThrow();
    expect(() => parseAuctionListings([{ ...realAuction, currentBidWld: '1.5' }])).toThrow();
    expect(() => parseAuctionListings([{ ...realAuction, endsAt: 'never' }])).toThrow();
    expect(() => parseAuctionListings([{ ...realAuction, sellerId: null }])).toThrow();
    expect(() => parseAuctionListings({ auctions: [realAuction] })).toThrow();
  });
});
