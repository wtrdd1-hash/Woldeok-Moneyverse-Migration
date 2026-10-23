import { expect, it, vi } from 'vitest';
import { SeoController } from './seo.controller';

it('must not expose crawler IP or internal key on public status', async () => {
  const service = { getSeoMetrics: vi.fn().mockResolvedValue({
    totalHits24h: 1, totalHits7d: 1, avgDurationMs: 10,
    botDistribution: {}, statusDistribution: {},
    stockCoverage: { indexed: 0, total: 0 }, guideCoverage: { indexed: 0, total: 0 },
    sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
    recentLogs: [{ ipAddress: '198.51.100.7' }], indexNowKey: 'sensitive-internal-key',
  }) };
  const controller = new SeoController(service as never, {} as never, {} as never, {} as never);
  const body = JSON.stringify(await controller.getStatus());
  expect(body).not.toContain('198.51.100.7');
  expect(body).not.toContain('sensitive-internal-key');
});
