import { describe, it, expect } from 'vitest';
import sitemap, { STOCK_SYMBOLS } from '@/app/sitemap';
import { stockJsonLd } from '@/lib/seo';
import { CORPORATE_DISCLOSURES } from '@/config/stock-disclosures.config';

describe('WDX Stocks SEO & Sitemap & Schema Enhancements', () => {
  it('contains all 18 virtual stock symbols including 8 WDX listed stocks in sitemap symbols', () => {
    const expectedWdx = [
      'WDX-TEC',
      'WDX-FIN',
      'WDX-RET',
      'WDX-LOG',
      'WDX-BIO',
      'WDX-ENT',
      'WDX-ENG',
      'WDX-DEF',
    ];

    for (const sym of expectedWdx) {
      expect(STOCK_SYMBOLS).toContain(sym);
    }
    expect(STOCK_SYMBOLS.length).toBe(18);
  });

  it('generates unique sitemap entries for all 18 stock symbol pages with multilingual alternates', () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(18);

    const stockSymbolUrls = entries.filter((e) =>
      STOCK_SYMBOLS.some((sym) => e.url.endsWith(`/stocks/${sym}`))
    );
    expect(stockSymbolUrls.length).toBe(18);

    for (const entry of stockSymbolUrls) {
      expect(entry.priority).toBe(0.9);
      expect(entry.changeFrequency).toBe('daily');
      expect(entry.alternates?.languages).toBeDefined();
      expect(entry.alternates?.languages?.['ko']).toBeDefined();
      expect(entry.alternates?.languages?.['en']).toBeDefined();
      expect(entry.alternates?.languages?.['ja']).toBeDefined();
      expect(entry.alternates?.languages?.['zh']).toBeDefined();
      expect(entry.alternates?.languages?.['x-default']).toBe(entry.url);
    }
  });

  it('generates valid Schema.org FinancialProduct JSON-LD for stock details', () => {
    const json = stockJsonLd({
      symbol: 'WDX-TEC',
      name: 'WDX 테크놀로지',
      description: '차세대 분산형 AI 컴퓨팅 및 알고리즘 개발 가상기업',
      price: 15400,
      currency: 'WLD',
      sector: '기술/IT',
    });

    expect(json['@context']).toBe('https://schema.org');
    expect(json['@type']).toBe('FinancialProduct');
    expect(json.identifier).toBe('WDX-TEC');
    expect(json.name).toBe('WDX 테크놀로지 (WDX-TEC)');
    expect(json.category).toBe('기술/IT');
    expect(json.offers.price).toBe('15400');
    expect(json.offers.priceCurrency).toBe('WLD');
    expect(json.provider.name).toBe('WDX 가상 증권거래소');
  });

  it('ensures corporate disclosures have valid impacts and severities', () => {
    expect(CORPORATE_DISCLOSURES.length).toBeGreaterThan(0);
    for (const disc of CORPORATE_DISCLOSURES) {
      expect(disc.symbol).toBeDefined();
      expect(disc.title).toBeDefined();
      expect(disc.expectedImpactPct).toBeDefined();
      expect(['up', 'down']).toContain(disc.impactDirection);
    }
  });
});
