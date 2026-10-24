// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { VerifiedListingPanel, VerifiedMarketplaceBoard } from './verified-marketplace-board';
import { formatMarketplacePrice } from './verified-marketplace-listings';

const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');

describe('verified marketplace member surface', () => {
  it('fetches owner and active rows from authenticated NestJS/PostgreSQL instead of synthetic fixtures', () => {
    expect(page).toContain("'/api/v1/marketplace/listings'");
    expect(page).toContain("'/api/v1/marketplace/my-listings'");
    expect(page).not.toContain("|| '1000'");
    expect(page).not.toContain('<MarketplaceTabs');
    expect(page).toContain('index: false');
  });
  it('never rounds or invents decimal WLD', () => {
    expect(formatMarketplacePrice('1250.5000')).toBe('1,250.5000');
    expect(formatMarketplacePrice('10000000000000000000')).toBe('10,000,000,000,000,000,000');
  });
  it('renders confirmed empty and unavailable states differently without a false success action', () => {
    const empty = renderToStaticMarkup(<VerifiedListingPanel listings={[]} mode="market" />);
    const unavailable = renderToStaticMarkup(<VerifiedListingPanel listings={null} mode="market" />);
    expect(empty).toContain('등록된 매물이 없습니다');
    expect(unavailable).toContain('조회할 수 없습니다');
    expect(empty).not.toContain('구매 확정');
    expect(unavailable).not.toContain('구매 확정');
  });
  it('renders only verified server records and clear read-only status', () => {
    const html = renderToStaticMarkup(<VerifiedListingPanel listings={[{
      id: '11111111-1111-4111-8111-111111111111',
      sellerId: '22222222-2222-4222-8222-222222222222',
      itemCode: 'frame_gold', name: '황금 액자', category: 'frame',
      rarity: 'EPIC', quantity: 2, priceWld: '1250.5000', status: 'ACTIVE',
      description: '진품', listedAt: '2026-10-24T00:00:00Z',
    }]} mode="market" />);
    expect(html).toContain('황금 액자');
    expect(html).toContain('1,250.5000');
    expect(html).toContain('읽기 전용');
    expect(html).not.toContain('구매 확정');
    expect(html).not.toContain('초대총독_알렉스');
  });
});


describe('marketplace privacy and keyboard-safe tabs', () => {
  it('applies HTTP noindex and no-store to the member route', () => {
    const config = readFileSync('next.config.ts', 'utf8');
    expect(config).toContain("source: '/marketplace'");
    expect(config).toContain("value: 'noindex, nofollow'");
    expect(config).toContain("value: 'private, no-store'");
  });
  it('keeps the member inventory and tab controls accessible on small screens', () => {
    const html = renderToStaticMarkup(<VerifiedMarketplaceBoard activeListings={[]} myListings={[]} holdings={[]} walletBalance={null} />);
    expect(html).toContain('거래소 매물');
    expect(html).toContain('내 등록 내역');
    expect(html).toContain('내 보관함');
    expect(html).toContain('min-h-11');
    expect(html).toContain('조회 불가');
  });
});
