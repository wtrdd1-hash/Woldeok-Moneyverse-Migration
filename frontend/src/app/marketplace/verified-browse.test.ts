import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseMarketplaceListings, parseMarketplaceHoldings, parseCashBalance } from './verified-browse';

const listing = {
  id: '11111111-1111-4111-8111-111111111111',
  seller_id: '22222222-2222-4222-8222-222222222222',
  item_code: 'frame_basic',
  item_name: '기본 프레임',
  category: 'cosmetic',
  rarity: 'COMMON',
  quantity: 1,
  price_wld: '1200.0000',
  status: 'ACTIVE',
  description: '실제 DB에 등록된 아이템',
  created_at: '2026-10-24T10:00:00.000Z',
};

describe('verified marketplace read model', () => {
  it('accepts the real NestJS array response and canonicalizes integral numeric WLD', () => {
    expect(parseMarketplaceListings([listing])).toEqual([{
      id: listing.id,
      name: '기본 프레임',
      category: 'cosmetic',
      quantity: 1,
      priceWld: '1200',
      description: listing.description,
      createdAt: listing.created_at,
    }]);
  });

  it('distinguishes an empty result from an unavailable or malformed API response', () => {
    expect(parseMarketplaceListings([])).toEqual([]);
    expect(parseMarketplaceListings(null)).toBeNull();
    expect(parseMarketplaceListings({ listings: [listing] })).toBeNull();
    expect(parseMarketplaceListings([{ ...listing, price_wld: '1200.5000' }])).toBeNull();
    expect(parseMarketplaceListings([{ ...listing, id: 'fake-1' }])).toBeNull();
    expect(parseMarketplaceListings([listing, listing])).toBeNull();
  });

  it('rejects invalid/settled listing and prevents money overflow/rounding', () => {
    expect(parseMarketplaceListings([{ ...listing, status: 'SETTLED' }])).toBeNull();
    expect(parseMarketplaceListings([{ ...listing, price_wld: '900719925474099312345.0000' }])?.[0]?.priceWld).toBe('900719925474099312345');
    expect(parseMarketplaceListings([{ ...listing, quantity: -1 }])).toBeNull();
  });

  it('shows only server-owned cash balance, never invents 1000 WLD', () => {
    expect(parseCashBalance({ balances: { cash: { availableAmount: '0' } } })).toBe('0');
    expect(parseCashBalance({ balances: { cash: { availableAmount: '900719925474099312345' } } })).toBe('900719925474099312345');
    expect(parseCashBalance(null)).toBeNull();
    expect(parseCashBalance({ balance: '1000' })).toBeNull();
    expect(parseCashBalance({ balances: { cash: { availableAmount: '-1' } } })).toBeNull();
  });

  it('uses actual owner holdings and refuses a missing/invalid collection', () => {
    const item = {
      catalog_id: listing.id, code: 'frame_basic', name: '기본 프레임',
      quantity: 2, category: 'cosmetic',
    };
    expect(parseMarketplaceHoldings({ holdings: [item] })).toEqual([{
      id: listing.id, name: '기본 프레임', quantity: 2, category: 'cosmetic',
    }]);
    expect(parseMarketplaceHoldings({ holdings: [] })).toEqual([]);
    expect(parseMarketplaceHoldings(null)).toBeNull();
    expect(parseMarketplaceHoldings({ holdings: [{ ...item, quantity: -2 }] })).toBeNull();
  });
});

describe('marketplace page safety boundary', () => {
  const page = readFileSync('src/app/marketplace/page.tsx', 'utf8');

  it('uses real existing backend endpoints and never falls back to fake balance/listings', () => {
    expect(page).toContain("'/api/v1/wallet?recent=1'");
    expect(page).toContain("'/api/v1/marketplace/listings?limit=50'");
    expect(page).toContain("'/api/v1/shop/holdings'");
    expect(page).not.toContain('/api/v1/wallet/summary');
    expect(page).not.toContain("|| '1000'");
    expect(page).not.toContain('MarketplaceTabs');
    expect(page).not.toContain('INITIAL_MARKET_LISTINGS');
  });

  it('keeps owner-only, uncached, unindexed and no fake settlement actions', () => {
    expect(page).toContain('await requireMember()');
    expect(page).toContain("dynamic = 'force-dynamic'");
    expect(page).toContain('robots: { index: false, follow: false }');
    expect(page).not.toContain('mutate(');
    expect(page).not.toContain('onBuyListing');
    expect(page).toContain('거래 기능은 안전성 검증 후 제공됩니다.');
  });
});
