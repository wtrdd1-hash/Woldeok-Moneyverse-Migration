import { describe, expect, it } from 'vitest';
import { parseMarketplaceListings } from './verified-marketplace-listings';

const row = {
  id: '11111111-1111-4111-8111-111111111111',
  seller_id: '22222222-2222-4222-8222-222222222222',
  item_code: 'frame_gold',
  item_name: '황금 액자',
  category: 'frame',
  rarity: 'EPIC',
  quantity: 2,
  price_wld: '1250.5000',
  status: 'ACTIVE',
  description: '진품',
  created_at: '2026-10-24T00:00:00Z',
};

describe('verified marketplace listing API rows', () => {
  it('accepts only PostgreSQL records and preserves exact WLD decimals and identity', () => {
    expect(parseMarketplaceListings([row])).toEqual([{
      id: row.id, sellerId: row.seller_id, itemCode: 'frame_gold', name: '황금 액자',
      category: 'frame', rarity: 'EPIC', quantity: 2, priceWld: '1250.5000',
      status: 'ACTIVE', description: '진품', listedAt: row.created_at,
    }]);
  });
  it('distinguishes a verified empty list from an unavailable API', () => {
    expect(parseMarketplaceListings([])).toEqual([]);
    expect(parseMarketplaceListings(null)).toBeNull();
    expect(parseMarketplaceListings({ listings: [] })).toBeNull();
  });
  it('rejects malformed, invented, non-positive and inconsistent listing records', () => {
    expect(parseMarketplaceListings([{ ...row, id: 'fake-1' }])).toBeNull();
    expect(parseMarketplaceListings([{ ...row, price_wld: '0' }])).toBeNull();
    expect(parseMarketplaceListings([{ ...row, price_wld: '1e9' }])).toBeNull();
    expect(parseMarketplaceListings([{ ...row, quantity: -1 }])).toBeNull();
    expect(parseMarketplaceListings([{ ...row, status: 'FAKE' }])).toBeNull();
    expect(parseMarketplaceListings([{ ...row, created_at: 'never' }])).toBeNull();
    expect(parseMarketplaceListings([{ ...row, seller_id: null }])).toBeNull();
  });
  it('supports authoritative owned listing lifecycle and rejects duplicate IDs', () => {
    expect(parseMarketplaceListings([{ ...row, status: 'SETTLED' }, { ...row, id: '33333333-3333-4333-8333-333333333333', status: 'CANCELLED' }])).toHaveLength(2);
    expect(parseMarketplaceListings([row, row])).toBeNull();
  });
});
