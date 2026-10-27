import type { SeoInitialData } from './seo-client-view';

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function duration(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function text(value: unknown): value is string {
  return typeof value === 'string';
}

function timestamp(value: unknown): value is string {
  return text(value) && value.length > 0 && Number.isFinite(Date.parse(value));
}

function path(value: unknown): value is string {
  return text(value) && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');
}

function distribution(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every(count);
}

function coverage(value: unknown): value is { indexed: number; total: number } {
  return isRecord(value) && count(value.indexed) && count(value.total) && value.indexed <= value.total;
}

function target(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!path(value.path) || !text(value.name)) return false;
  if (!['stock', 'guide', 'hub', 'static'].includes(String(value.category))) return false;
  if (!['healthy', 'warning', 'unindexed'].includes(String(value.healthStatus))) return false;
  if (value.lastVisitedAt !== null && !timestamp(value.lastVisitedAt)) return false;
  if (value.lastBot !== null && !text(value.lastBot)) return false;
  if (value.lastStatusCode !== null && (!count(value.lastStatusCode) || value.lastStatusCode > 599)) return false;
  return true;
}

function log(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return text(value.id) && value.id.length > 0
    && text(value.botName) && path(value.path)
    && count(value.statusCode) && value.statusCode <= 599
    && duration(value.durationMs)
    && text(value.ipAddress) && text(value.userAgent)
    && timestamp(value.createdAt);
}

function unique(values: unknown[], key: string): boolean {
  const keys = values.map((entry) => (entry as RecordValue)[key]);
  return new Set(keys).size === keys.length;
}

function sitemapUrl(value: unknown): value is string {
  if (!text(value)) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.pathname === '/sitemap.xml';
  } catch {
    return false;
  }
}

/** A TypeScript generic on api<T> does not validate the JSON crossing the trust boundary. */
export function parseSeoObservation(value: unknown, observedAt: string): SeoInitialData | null {
  if (!isRecord(value) || !timestamp(observedAt)) return null;
  const {
    totalHits24h, totalHits7d, avgDurationMs, botDistribution, statusDistribution,
    stockCoverage, guideCoverage, targetUrls, recentLogs, indexNowKey,
  } = value;

  if (!count(totalHits24h) || !count(totalHits7d) || totalHits7d < totalHits24h || !duration(avgDurationMs)) return null;
  if (!distribution(botDistribution) || !distribution(statusDistribution)) return null;
  if (!coverage(stockCoverage) || !coverage(guideCoverage)) return null;
  if (!Array.isArray(targetUrls) || targetUrls.length > 200 || !targetUrls.every(target) || !unique(targetUrls, 'path')) return null;
  if (!Array.isArray(recentLogs) || recentLogs.length > 100 || !recentLogs.every(log) || !unique(recentLogs, 'id')) return null;
  if (!text(indexNowKey) || !indexNowKey.trim() || !sitemapUrl(value.sitemapUrl)) return null;

  const sum = (values: Record<string, number>) => Object.values(values).reduce((total, entry) => total + entry, 0);
  if (sum(botDistribution) !== totalHits24h || sum(statusDistribution) !== totalHits24h) return null;
  if (targetUrls.filter((entry) => entry.category === 'stock').length !== stockCoverage.total) return null;
  if (targetUrls.filter((entry) => entry.category === 'guide').length !== guideCoverage.total) return null;

  return {
    totalHits24h,
    totalHits7d,
    avgDurationMs,
    botDistribution,
    statusDistribution,
    stockCoverage,
    guideCoverage,
    targetUrls: targetUrls as SeoInitialData['targetUrls'],
    recentLogs: recentLogs as SeoInitialData['recentLogs'],
    indexNowKey,
    sitemapUrl: value.sitemapUrl,
    provenance: {
      source: 'seo-status-api',
      observedAt,
      freshness: 'fresh',
      status: 'operational',
    },
  };
}

/** A failed refresh must not leave the previous successful counters looking live. */
export function unavailableSeoObservation(): SeoInitialData {
  return {
    totalHits24h: 0,
    totalHits7d: 0,
    avgDurationMs: 0,
    botDistribution: {},
    statusDistribution: {},
    stockCoverage: { indexed: 0, total: 0 },
    guideCoverage: { indexed: 0, total: 0 },
    targetUrls: [],
    recentLogs: [],
    indexNowKey: '',
    sitemapUrl: '',
    provenance: {
      source: 'fallback',
      observedAt: null,
      freshness: 'unknown',
      status: 'unavailable',
    },
  };
}
