import type { SeoMetricsResponse } from './seo.service';

export const PUBLIC_SEO_STATUS_FIELDS = [
  'totalHits24h', 'totalHits7d', 'avgDurationMs', 'botDistribution',
  'statusDistribution', 'stockCoverage', 'guideCoverage', 'sitemapUrl',
] as const;

function canonicalBotName(raw: string): string {
  const name = raw.toLowerCase();
  if (name.includes('googlebot')) return 'Googlebot';
  if (name.includes('bingbot')) return 'Bingbot';
  if (name.includes('duckduckbot')) return 'DuckDuckBot';
  if (name.includes('baiduspider')) return 'Baiduspider';
  if (name.includes('applebot')) return 'Applebot';
  if (name.includes('yandexbot')) return 'YandexBot';
  if (name.includes('yeti')) return 'Yeti';
  if (name.includes('naver')) return 'Naver';
  return 'Other';
}

function safeDistribution(
  raw: Record<string, number>,
  labelFor: (key: string) => string,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, count] of Object.entries(raw)) {
    if (!Number.isSafeInteger(count) || count < 0) continue;
    const label = labelFor(key);
    result[label] = (result[label] ?? 0) + count;
  }
  return result;
}

/** Aggregate keys are derived from untrusted crawler input, so labels must not leak it. */
export function publicSeoMetrics(data: SeoMetricsResponse) {
  const { totalHits24h, totalHits7d, avgDurationMs, stockCoverage, guideCoverage, sitemapUrl } = data;
  const botDistribution = safeDistribution(data.botDistribution, canonicalBotName);
  const statusDistribution = safeDistribution(data.statusDistribution,
    (key) => /^[1-5][0-9]{2}$/.test(key) ? key : 'unknown');
  return { totalHits24h, totalHits7d, avgDurationMs, botDistribution, statusDistribution,
    stockCoverage, guideCoverage, sitemapUrl };
}
