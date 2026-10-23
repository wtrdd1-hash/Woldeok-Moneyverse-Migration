import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';
const noStore = { 'Cache-Control': 'no-store' };
const allowedBotNames = new Set([
  'Googlebot', 'Bingbot', 'Yeti', 'Naver', 'DuckDuckBot',
  'Baiduspider', 'Applebot', 'YandexBot', 'Other',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isCoverage(value: unknown): boolean {
  return isRecord(value) && isCount(value.indexed) && isCount(value.total)
    && value.indexed <= value.total;
}

function isDistribution(value: unknown, kind: 'bot' | 'status'): boolean {
  if (!isRecord(value) || Object.keys(value).length > 32) return false;
  return Object.entries(value).every(([label, count]) =>
    isCount(count) && (kind === 'bot'
      ? allowedBotNames.has(label)
      : label === 'unknown' || /^[1-5][0-9]{2}$/.test(label)));
}

function isSitemapUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:')
      && !url.username && !url.password && !url.search && !url.hash
      && url.pathname.endsWith('/sitemap.xml');
  } catch {
    return false;
  }
}

type PublicSeoMetrics = Record<string, unknown> & {
  stockCoverage: { indexed: number; total: number };
  guideCoverage: { indexed: number; total: number };
};

function isPublicSeoMetrics(value: unknown): value is PublicSeoMetrics {
  if (!isRecord(value)) return false;
  return isCount(value.totalHits24h) && isCount(value.totalHits7d)
    && value.totalHits24h <= value.totalHits7d
    && typeof value.avgDurationMs === 'number'
    && Number.isFinite(value.avgDurationMs) && value.avgDurationMs >= 0
    && isDistribution(value.botDistribution, 'bot')
    && isDistribution(value.statusDistribution, 'status')
    && isCoverage(value.stockCoverage) && isCoverage(value.guideCoverage)
    && isSitemapUrl(value.sitemapUrl);
}

/** Fail closed on malformed upstream data; never expose arbitrary crawler labels. */
export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${API_ORIGIN}/api/v1/seo/status`, {
      method: 'GET',
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'seo_status_unavailable' }, { status: 503, headers: noStore });
    }
    const data: unknown = await response.json();
    if (!isPublicSeoMetrics(data)) {
      return NextResponse.json({ error: 'seo_status_invalid' }, { status: 502, headers: noStore });
    }
    const { totalHits24h, totalHits7d, avgDurationMs, botDistribution, statusDistribution,
      stockCoverage, guideCoverage, sitemapUrl } = data;
    return NextResponse.json({
      totalHits24h, totalHits7d, avgDurationMs, botDistribution, statusDistribution,
      stockCoverage: { indexed: stockCoverage.indexed, total: stockCoverage.total },
      guideCoverage: { indexed: guideCoverage.indexed, total: guideCoverage.total },
      sitemapUrl,
    }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'seo_status_unavailable' }, { status: 503, headers: noStore });
  }
}
