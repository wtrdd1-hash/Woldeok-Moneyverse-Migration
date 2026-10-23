import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';
const noStore = { 'Cache-Control': 'no-store' };

/** Defense in depth: only aggregate metrics are available to guests. */
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
    const data = await response.json();
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'seo_status_invalid' }, { status: 502, headers: noStore });
    }
    const { totalHits24h, totalHits7d, avgDurationMs, botDistribution, statusDistribution,
      stockCoverage, guideCoverage, sitemapUrl } = data;
    return NextResponse.json({
      totalHits24h, totalHits7d, avgDurationMs, botDistribution, statusDistribution,
      stockCoverage, guideCoverage, sitemapUrl,
    }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: 'seo_status_unavailable' }, { status: 503, headers: noStore });
  }
}