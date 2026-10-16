import { describe, expect, it, vi } from 'vitest';
import { SeoDailyDigestService } from './seo-daily-digest.service';
import type { SeoService } from './seo.service';

describe('daily SEO digest versus suspended blog publishing', () => {
  it('produces the analytics digest without calling the legacy AI blog publishing endpoint', async () => {
    const seoService = {
      getGscAnalytics: vi.fn().mockResolvedValue({
        totalClicks30d: 0, totalImpressions30d: 0,
        avgCtr30d: 0, avgPosition30d: 0,
        topQueries: [], timeSeries: [],
      }),
    } as unknown as SeoService;
    const requestSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('unexpected network request'));
    try {
      const digest = await new SeoDailyDigestService(seoService).sendDailyDigest();
      expect(digest.totalClicks30d).toBe(0);
      expect(requestSpy).not.toHaveBeenCalled();
    } finally {
      requestSpy.mockRestore();
    }
  });
});
