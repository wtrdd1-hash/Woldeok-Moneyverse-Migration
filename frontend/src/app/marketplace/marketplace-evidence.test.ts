import { describe, expect, it } from 'vitest';
import { parseVerifiedMarketplaceListings } from './marketplace-evidence';

const listing = {
  id: '11111111-1111-4111-8111-111111111111',
  seller_id: '22222222-2222-4222-8222-222222222222',
  item_name: 'Verified artifact',
  item_code: 'verified_artifact',
  category: 'display',
  rarity: 'rare',
  quantity: 2,
  price_wld: '1250',
  listing_fee_wld: '13',
  status: 'ACTIVE',
  description: 'Source-verified marketplace listing',
  created_at: '2026-10-30T09:00:00.000Z',
};

describe('parseVerifiedMarketplaceListings', () => {
  it('accepts authenticated DB-backed listing data without creating balances or receipts', () => {
    expect(parseVerifiedMarketplaceListings([listing])).toEqual([{
      id: listing.id,
      itemName: listing.item_name,
      quantity: 2,
      priceWld: '1250',
      createdAt: listing.created_at,
    }]);
  });

  it('distinguishes verified empty results from failed or malformed responses', () => {
    expect(parseVerifiedMarketplaceListings([])).toEqual([]);
    expect(parseVerifiedMarketplaceListings([{ ...listing, price_wld: '1250.0000' }])?.[0]?.priceWld).toBe('1250');
    expect(parseVerifiedMarketplaceListings(null)).toBeNull();
    expect(parseVerifiedMarketplaceListings({ listings: [] })).toBeNull();
    expect(parseVerifiedMarketplaceListings([{ ...listing, price_wld: 'NaN' }])).toBeNull();
    expect(parseVerifiedMarketplaceListings([{ ...listing, price_wld: '1.5' }])).toBeNull();
    expect(parseVerifiedMarketplaceListings([{ ...listing, quantity: -1 }])).toBeNull();
    expect(parseVerifiedMarketplaceListings([{ ...listing, status: 'SETTLED' }])).toBeNull();
  });

  it('rejects duplicate IDs, malformed UUIDs and unexpected page size', () => {
    expect(parseVerifiedMarketplaceListings([listing, listing])).toBeNull();
    expect(parseVerifiedMarketplaceListings([{ ...listing, id: 'demo' }])).toBeNull();
    expect(parseVerifiedMarketplaceListings(Array.from({ length: 51 }, (_, i) => ({
      ...listing, id: `${String(i).padStart(8, '0')}-1111-4111-8111-111111111111`,
    })))).toBeNull();
  });
});
