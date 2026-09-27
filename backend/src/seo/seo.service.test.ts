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
});
