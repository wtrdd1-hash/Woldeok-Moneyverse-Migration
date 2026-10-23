import { expect, it, vi } from 'vitest';
import { SeoController } from './seo.controller';
import { PUBLIC_SEO_STATUS_FIELDS } from './seo-status-public';

it('public status projects only canonical aggregates from a complete service response', async () => {
  const service = { getSeoMetrics: vi.fn().mockResolvedValue({
    totalHits24h: 1,
    totalHits7d: 2,
    avgDurationMs: 12,
    botDistribution: { 'Googlebot-Image': 1, 'private-user-agent': 1 },
    statusDistribution: { '200': 1, 'private-status': 1 },
    stockCoverage: { indexed: 1, total: 2 },
    guideCoverage: { indexed: 1, total: 3 },
    sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
    recentLogs: [{ ipAddress: '198.51.100.1', userAgent: 'private-user-agent' }],
    targetUrls: [{ path: '/private-path' }],
    indexNowKey: 'private-indexnow-key',
  }) };
  const controller = new SeoController(service as never, {} as never, {} as never, {} as never);
  const response = await controller.getStatus();
  expect(Object.keys(response)).toEqual(PUBLIC_SEO_STATUS_FIELDS);
  expect(response.botDistribution).toEqual({ Googlebot: 1, Other: 1 });
  expect(response.statusDistribution).toEqual({ '200': 1, unknown: 1 });
  expect(JSON.stringify(response)).not.toMatch(/198\.51\.100\.1|private-user-agent|private-path|private-indexnow-key/);
});
