import { expect, it } from 'vitest';
import { publicSeoMetrics } from './seo-status-public';

it('projects coverage counters without nested private service fields', () => {
  const source = {
    totalHits24h: 1, totalHits7d: 1, avgDurationMs: 1,
    botDistribution: {}, statusDistribution: {},
    stockCoverage: { indexed: 1, total: 2, internalPath: '/internal/stock' },
    guideCoverage: { indexed: 1, total: 2, auditSecret: 'secret-internal-audit' },
    sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
  };
  const publicData = publicSeoMetrics(source as never);
  expect(publicData.stockCoverage).toEqual({ indexed: 1, total: 2 });
  expect(publicData.guideCoverage).toEqual({ indexed: 1, total: 2 });
});
