import { describe, expect, it, vi } from 'vitest';
import * as gscClient from './gsc-client';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  it('should initialize and return a valid IndexNow key', () => {
    const service = new SeoService();
    const key = service.getIndexNowKey();
    expect(key).toBeDefined();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(5);
  });

  it('should record crawler hits in memory ring buffer and compute metrics', async () => {
    const service = new SeoService();

    await service.recordHit({
      botName: 'Googlebot',
      path: '/stocks/CHIPS',
      statusCode: 200,
      durationMs: 42,
      ipAddress: '66.249.66.1',
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    });

    await service.recordHit({
      botName: 'Yeti',
      path: '/guide/stock-trading',
      statusCode: 200,
      durationMs: 38,
      ipAddress: '125.209.235.1',
      userAgent: 'Naver Yeti',
    });

    const metrics = await service.getSeoMetrics();
    expect(metrics.totalHits24h).toBe(2);
    expect(metrics.botDistribution['Googlebot']).toBe(1);
    expect(metrics.botDistribution['Yeti']).toBe(1);
    expect(metrics.recentLogs.length).toBe(2);

    const chipsTarget = metrics.targetUrls.find((t) => t.path === '/stocks/CHIPS');
    expect(chipsTarget).toBeDefined();
    expect(chipsTarget?.healthStatus).toBe('healthy');
    expect(chipsTarget?.lastBot).toBe('Googlebot');

    const guideTarget = metrics.targetUrls.find((t) => t.path === '/guide/stock-trading');
    expect(guideTarget).toBeDefined();
    expect(guideTarget?.healthStatus).toBe('healthy');
    expect(guideTarget?.lastBot).toBe('Yeti');
  });

  it('should handle submitUrls without breaking', async () => {
    const service = new SeoService();
    const result = await service.submitUrls(['/stocks/DUCKS', '/guide/dopamine-system']);

    expect(result.success).toBe(true);
    expect(result.submittedUrls.length).toBe(2);
    expect(result.indexNowResponses.length).toBe(3);
    expect(result.googlePingStatus).toBeDefined();
  });

  it('returns an explicit unconfigured state instead of fabricated GSC metrics', async () => {
    const service = new SeoService();
    const analytics = await service.getGscAnalytics();

    expect(analytics).toMatchObject({
      hasCredentials: false,
      clientEmail: null,
      propertyUrl: null,
      source: 'unconfigured',
      syncError: null,
      totalClicks30d: 0,
      totalImpressions30d: 0,
      avgCtr30d: 0,
      avgPosition30d: 0,
    });
    expect(analytics.timeSeries).toEqual([]);
    expect(analytics.topQueries).toEqual([]);
  });

  it('validates a GSC credential before caching it and removes it cleanly', async () => {
    const parsed = {
      type: 'service_account' as const,
      clientEmail: 'test-sa@moneyverse-gsc.iam.gserviceaccount.com',
      privateKey: 'test-signing-material',
      projectId: 'moneyverse-gsc',
    };
    const snapshot = {
      propertyUrl: 'sc-domain:easy-scraping.com',
      timeSeries: [{ date: '2026-10-04', clicks: 12, impressions: 120, ctr: 10, position: 2.5 }],
      topQueries: [{ query: 'moneyverse', clicks: 12, impressions: 120, ctr: 10, position: 2.5 }],
      totalClicks30d: 12,
      totalImpressions30d: 120,
      avgCtr30d: 10,
      avgPosition30d: 2.5,
    };
    const parseSpy = vi.spyOn(gscClient, 'parseGscServiceAccount').mockReturnValue(parsed);
    const fetchSpy = vi.spyOn(gscClient, 'fetchGscAnalyticsSnapshot').mockResolvedValue(snapshot);
    const service = new SeoService();

    try {
      const saveResult = await service.saveGscCredentials('test-service-account-json');
      expect(saveResult).toMatchObject({
        success: true,
        clientEmail: parsed.clientEmail,
        propertyUrl: snapshot.propertyUrl,
      });

      const analytics = await service.getGscAnalytics();
      expect(analytics).toMatchObject({
        hasCredentials: true,
        source: 'search-console',
        totalClicks30d: 12,
        totalImpressions30d: 120,
      });

      const deleteResult = await service.deleteGscCredentials();
      expect(deleteResult.success).toBe(true);
      const afterDelete = await service.getGscAnalytics();
      expect(afterDelete.source).toBe('unconfigured');
      expect(afterDelete.hasCredentials).toBe(false);
    } finally {
      fetchSpy.mockRestore();
      parseSpy.mockRestore();
    }
  });

  it('refuses Search Console sitemap submission when SEO indexing is disabled for Test', async () => {
    const previous = process.env.SEO_INDEXING_ENABLED;
    process.env.SEO_INDEXING_ENABLED = 'false';
    const submitSpy = vi.spyOn(gscClient, 'submitGscSitemap');
    const service = new SeoService();

    try {
      await expect(service.submitGscSitemap()).rejects.toThrow('운영 환경에서만');
      expect(submitSpy).not.toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete process.env.SEO_INDEXING_ENABLED;
      else process.env.SEO_INDEXING_ENABLED = previous;
      submitSpy.mockRestore();
    }
  });

  it('uses the registered Search Console credential to submit the production sitemap', async () => {
    const parsed = {
      type: 'service_account' as const,
      clientEmail: 'test-sa@moneyverse-gsc.iam.gserviceaccount.com',
      privateKey: 'test-signing-material',
      projectId: 'moneyverse-gsc',
    };
    const snapshot = {
      propertyUrl: 'sc-domain:easy-scraping.com',
      timeSeries: [],
      topQueries: [],
      totalClicks30d: 0,
      totalImpressions30d: 0,
      avgCtr30d: 0,
      avgPosition30d: 0,
    };
    const sitemapStatus = {
      propertyUrl: snapshot.propertyUrl,
      sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
      lastSubmitted: '2026-10-07T00:05:00.000Z',
      lastDownloaded: null,
      isPending: true,
      warnings: 0,
      errors: 0,
      submittedUrlCount: 642,
    };
    const parseSpy = vi.spyOn(gscClient, 'parseGscServiceAccount').mockReturnValue(parsed);
    const analyticsSpy = vi.spyOn(gscClient, 'fetchGscAnalyticsSnapshot').mockResolvedValue(snapshot);
    const submitSpy = vi.spyOn(gscClient, 'submitGscSitemap').mockResolvedValue(sitemapStatus);
    const service = new SeoService();

    try {
      await service.saveGscCredentials('test-service-account-json');
      const result = await service.submitGscSitemap();

      expect(submitSpy).toHaveBeenCalledWith(
        parsed,
        'https://easy-scraping.com',
        snapshot.propertyUrl,
        'https://easy-scraping.com/sitemap.xml',
      );
      expect(result).toMatchObject({ success: true, ...sitemapStatus });
    } finally {
      submitSpy.mockRestore();
      analyticsSpy.mockRestore();
      parseSpy.mockRestore();
    }
  });
});

import { SeoCrawlerAuditService } from './seo-crawler-audit.service';
import { SeoDailyDigestService } from './seo-daily-digest.service';
import type { DiscordAlertService } from '../discord/discord-alert.service';

describe('SeoCrawlerAuditService', () => {
  it('should run crawl audit and generate comprehensive health summary', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as unknown as Response);

    try {
      const seoService = new SeoService();
      const auditService = new SeoCrawlerAuditService(seoService);

      const result = await auditService.runCrawlAudit();
      expect(result).toBeDefined();
      expect(result.totalUrlsChecked).toBeGreaterThan(10);
      expect(result.healthyUrls).toBe(result.totalUrlsChecked);
      expect(result.errorUrls).toBe(0);
      expect(result.timestamp).toBeDefined();
      expect(auditService.getLastAuditResult()).toEqual(result);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('SeoDailyDigestService', () => {
  it('should generate and dispatch daily SEO digest report', async () => {
    const seoService = new SeoService();
    const mockDiscordAlertService = {
      sendDiscordEmbed: vi.fn().mockResolvedValue(true),
    };

    const digestService = new SeoDailyDigestService(
      seoService,
      mockDiscordAlertService as unknown as DiscordAlertService,
    );

    const result = await digestService.sendDailyDigest();
    expect(result).toBeDefined();
    expect(result.totalClicks30d).toBe(0);
    expect(result.totalImpressions30d).toBe(0);
    expect(result.topQueriesCount).toBe(0);
    expect(result.discordNotified).toBe(true);
    expect(result.message).toContain('성공적으로 전송');
    expect(mockDiscordAlertService.sendDiscordEmbed).toHaveBeenCalledTimes(1);

    const lastResult = digestService.getLastDigestResult();
    expect(lastResult).toEqual(result);
  });
});


