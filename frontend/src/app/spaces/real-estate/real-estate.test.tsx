// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { PREMIER_LAND_PARCELS, calculateRealEstateTax } from '@moneyverse/contract';

const source = readFileSync('src/app/spaces/real-estate/page.tsx', 'utf8');

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

  it('implements 2026 Bento Grid 2.0 Inset Border and responsive design standards', () => {
    expect(source).toContain('border-zinc-800/80');
    expect(source).toContain('shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]');
    expect(source).toContain('font-mono tabular-nums');
    expect(source).toContain('min-h-[44px]');
  });

  it('provides passive rent claim and commercial building upgrade interactions', () => {
    expect(source).toContain('handleClaimRent');
    expect(source).toContain('handleUpgradeBuilding');
    expect(source).toContain('일일 패시브 임대료');
    expect(source).toContain('상업시설 증축이 완료되어');
  });
});
