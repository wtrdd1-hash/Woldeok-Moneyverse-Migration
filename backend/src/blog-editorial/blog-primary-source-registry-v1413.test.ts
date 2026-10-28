import { describe, expect, it } from 'vitest';
import { PRIMARY_SOURCES, sourceUrlFor } from './blog-primary-sources';
import type { BlogRotationSlot } from './blog-two-hour-rotation';

describe('v1413 registered official primary source coverage', () => {
  it('provides 12 fixed https primary sources for four local country editions', () => {
    for (const country of ['KR','US','JP','CN'] as const) {
      for (const topic of ['ECONOMY','CODING','COMPUTER'] as const) {
        const url = PRIMARY_SOURCES[country][topic];
        expect(url).toMatch(/^https:\/\/[^\s/]+\//);
        expect(url).not.toMatch(/[?#]/);
        const slot = { country, topic } as BlogRotationSlot;
        expect(sourceUrlFor(slot)).toBe(url);
      }
    }
  });
  it('keeps the Chinese economics source on the live official PBOC monetary policy page', () => {
    expect(PRIMARY_SOURCES.CN.ECONOMY)
      .toBe('https://www.pbc.gov.cn/zhengcehuobisi/125207/index.html');
  });
});
