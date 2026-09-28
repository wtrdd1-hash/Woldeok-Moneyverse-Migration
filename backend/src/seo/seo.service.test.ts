import { describe, expect, it } from 'vitest';
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

  it('should compute GSC Search Analytics 30-day time series and top queries', async () => {
    const service = new SeoService();
    const analytics = await service.getGscAnalytics();

    expect(analytics).toBeDefined();
    expect(analytics.timeSeries.length).toBe(30);
    expect(analytics.totalClicks30d).toBeGreaterThan(0);
    expect(analytics.totalImpressions30d).toBeGreaterThan(0);
    expect(analytics.avgCtr30d).toBeGreaterThan(0);
    expect(analytics.avgPosition30d).toBeGreaterThan(0);
    expect(analytics.topQueries.length).toBe(10);
    expect(analytics.topQueries[0].query).toBe('가상 주식 모의투자');
  });

  it('should save and delete GSC service account credentials', async () => {
    const service = new SeoService();
    const sampleKey = JSON.stringify({
      type: 'service_account',
      project_id: 'moneyverse-gsc',
      client_email: 'test-sa@moneyverse-gsc.iam.gserviceaccount.com',
      private_key: 'test-private-key',
    });

    const saveResult = await service.saveGscCredentials(sampleKey);
    expect(saveResult.success).toBe(true);
    expect(saveResult.clientEmail).toBe('test-sa@moneyverse-gsc.iam.gserviceaccount.com');

    const analytics = await service.getGscAnalytics();
    expect(analytics.hasCredentials).toBe(true);
    expect(analytics.clientEmail).toBe('test-sa@moneyverse-gsc.iam.gserviceaccount.com');

    const deleteResult = await service.deleteGscCredentials();
    expect(deleteResult.success).toBe(true);
  });
});

import { SeoCrawlerAuditService } from './seo-crawler-audit.service';
import { SeoDailyDigestService } from './seo-daily-digest.service';
import { vi } from 'vitest';

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
      mockDiscordAlertService as unknown as any,
    );

    const result = await digestService.sendDailyDigest();
    expect(result).toBeDefined();
    expect(result.totalClicks30d).toBeGreaterThan(0);
    expect(result.totalImpressions30d).toBeGreaterThan(0);
    expect(result.topQueriesCount).toBe(5);
    expect(result.discordNotified).toBe(true);
    expect(result.message).toContain('성공적으로 전송');
    expect(mockDiscordAlertService.sendDiscordEmbed).toHaveBeenCalledTimes(1);

    const lastResult = digestService.getLastDigestResult();
    expect(lastResult).toEqual(result);
  });
});


