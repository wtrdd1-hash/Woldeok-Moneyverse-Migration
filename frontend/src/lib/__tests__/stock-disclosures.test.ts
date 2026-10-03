import { describe, it, expect } from 'vitest';
import {
  CORPORATE_DISCLOSURES,
  STOCK_SECTOR_MAP,
} from '@/config/stock-disclosures.config';

describe('Corporate Disclosure Dataset (Section 5.6)', () => {
  it('contains valid disclosure entries with verified official flags and impact predictions', () => {
    expect(CORPORATE_DISCLOSURES.length).toBeGreaterThan(0);

    for (const disc of CORPORATE_DISCLOSURES) {
      expect(disc.id).toBeDefined();
      expect(disc.symbol).toBeDefined();
      expect(disc.companyName).toBeDefined();
      expect(disc.title).toContain('[공시]');
      expect(disc.summary.length).toBeGreaterThan(10);
      expect(disc.detailedBody.length).toBeGreaterThan(20);
      expect(disc.verifiedOfficial).toBe(true);
      expect(['up', 'down']).toContain(disc.impactDirection);
      expect(disc.expectedImpactPct).toMatch(/[+-]\d+(\.\d+)?%/);
    }
  });

  it('maps all major virtual stock symbols to valid sectors', () => {
    const requiredSymbols = ['WDG', 'CHIMU314', 'WDM', 'WDB', 'WDT', 'MYUY', 'SPACE'];

    for (const sym of requiredSymbols) {
      expect(STOCK_SECTOR_MAP[sym]).toBeDefined();
      expect(['기술', '금융', '유통', '물류', '에너지', '바이오', '엔터', '지수']).toContain(
        STOCK_SECTOR_MAP[sym],
      );
    }
  });
});
