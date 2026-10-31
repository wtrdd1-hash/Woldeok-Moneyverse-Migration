// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { PREMIER_LAND_PARCELS, calculateRealEstateTax } from '@moneyverse/contract';

const pageSource = readFileSync('src/app/spaces/real-estate/page.tsx', 'utf8');
const viewSource = readFileSync('src/components/personal-spaces-view.tsx', 'utf8');
const combinedSource = `${pageSource}\n${viewSource}`;

describe('Virtual Real Estate & Land Leasing System (/spaces/real-estate)', () => {
  it('defines 10 premier virtual land parcels with commercial construction and yields', () => {
    expect(PREMIER_LAND_PARCELS).toHaveLength(10);
    expect(PREMIER_LAND_PARCELS.map((p) => p.name)).toContain('강남 테헤란로 1번가');
    expect(PREMIER_LAND_PARCELS.map((p) => p.name)).toContain('여의도 국제금융로 타운');
    expect(PREMIER_LAND_PARCELS.map((p) => p.name)).toContain('뉴욕 월스트리트 11번지');
    expect(PREMIER_LAND_PARCELS.map((p) => p.name)).toContain('실리콘밸리 샌드힐로드 100');
  });

  it('calculates 3.0% acquisition tax and 0.5% weekly property tax hard sinks', () => {
    const tax = calculateRealEstateTax(78500000);
    expect(tax.acquisitionTaxWld).toBe(2355000);
    expect(tax.weeklyPropertyTaxWld).toBe(392500);
  });

  it('shows an accessible non-indexable unavailable state instead of fabricated auction metrics', () => {
    expect(pageSource).toContain('robots: { index: false, follow: false }');
    expect(pageSource).toContain('requireMember');
    expect(pageSource).toContain('role="status"');
    expect(pageSource).toContain('aria-live="polite"');
    expect(pageSource).toContain('min-h-11');
    expect(pageSource).not.toContain('RealEstateAuctionClient');
    expect(pageSource).not.toContain('PersonalSpacesView');
    expect(pageSource).not.toContain('연 13.4%');
  });
});
