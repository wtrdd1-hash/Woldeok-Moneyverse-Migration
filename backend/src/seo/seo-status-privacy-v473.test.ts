import { expect, it } from 'vitest';
import { PUBLIC_SEO_STATUS_FIELDS, publicSeoMetrics } from './seo-status-public';

it('does not expose crawler logs in public SEO status', () => {
  expect(PUBLIC_SEO_STATUS_FIELDS).not.toContain('recentLogs');
  expect(PUBLIC_SEO_STATUS_FIELDS).not.toContain('indexNowKey');
});

it('normalizes untrusted crawler labels before publishing aggregates', () => {
  const metrics = {
    totalHits24h: 5, totalHits7d: 5, avgDurationMs: 4,
    botDistribution: { 'Googlebot-Image': 2, 'unknown-crawler-label': 3 },
    statusDistribution: { '200': 2, 'unknown-status': 3 },
    stockCoverage: { indexed: 1, total: 10 },
    guideCoverage: { indexed: 1, total: 5 },
    sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
    recentLogs: [{ path: '/private' }],
    targetUrls: [],
    indexNowKey: 'example-key',
  };
  const projected = publicSeoMetrics(metrics as never);
  expect(Object.keys(projected)).toEqual(PUBLIC_SEO_STATUS_FIELDS);
  expect(projected.botDistribution).toEqual({ Googlebot: 2, Other: 3 });
  expect(projected.statusDistribution).toEqual({ '200': 2, unknown: 3 });
  expect(projected).not.toHaveProperty('recentLogs');
  expect(projected).not.toHaveProperty('indexNowKey');
});
