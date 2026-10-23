import type { SeoMetricsResponse } from './seo.service';

export const PUBLIC_SEO_STATUS_FIELDS = [
  'totalHits24h', 'totalHits7d', 'avgDurationMs', 'botDistribution',
  'statusDistribution', 'stockCoverage', 'guideCoverage', 'sitemapUrl',
] as const;

/** Explicit public projection; no crawler records, target paths or secrets. */
export function publicSeoMetrics(data: SeoMetricsResponse) {
  const { totalHits24h, totalHits7d, avgDurationMs, botDistribution, statusDistribution,
    stockCoverage, guideCoverage, sitemapUrl } = data;
  return { totalHits24h, totalHits7d, avgDurationMs, botDistribution, statusDistribution,
    stockCoverage, guideCoverage, sitemapUrl };
}