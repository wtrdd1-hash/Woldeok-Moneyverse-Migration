import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { submitToIndexNow, INDEXNOW_HOST } from '@/lib/indexnow';
import { ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';
import { getPublicSitemapRoutes } from '@/config/routes.config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let targetUrls: string[] = [];

    if (Array.isArray(body.urls) && body.urls.length > 0) {
      targetUrls = body.urls;
    } else {
      // Default: Submit all static routes, presets, and pSEO URLs
      const base = `https://${INDEXNOW_HOST}`;
      const staticUrls = getPublicSitemapRoutes()
        .filter((r) => !r.path.includes('['))
        .map((r) => `${base}${r.path === '/' ? '' : r.path}`);

      const presetUrls = ALL_SEO_PRESETS.map((p) => `${base}/tools/${p.category}-calculator/${p.slug}`);
      const pseoUrls = ALL_PSEO_POPULAR_SLUGS.map((slug) => `${base}/tools/stock-calculator/${slug}`);

      targetUrls = [...staticUrls, ...presetUrls, ...pseoUrls];
    }

    const result = await submitToIndexNow(targetUrls);
    return NextResponse.json({
      ok: result.success,
      submittedCount: result.submittedCount,
      status: result.status,
      detail: result.responseText || result.error,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Moneyverse IndexNow Gateway',
    host: INDEXNOW_HOST,
    totalPseoUrls: ALL_PSEO_POPULAR_SLUGS.length,
    status: 'operational',
  });
}
