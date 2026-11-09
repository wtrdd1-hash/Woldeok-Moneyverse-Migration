import { buildUrlsetXml, canonicalUrl } from '@/lib/seo';
import { getPublicSitemapRoutes } from '@/config/routes.config';
import { getVerifiedLocalePaths } from '@/lib/seo-locale-alternates';

export const revalidate = 3600;

const RELEASE_TIMESTAMP = (process.env.APP_RELEASE_DATE ? new Date(process.env.APP_RELEASE_DATE) : new Date('2026-11-08T00:00:00.000Z')).toISOString();

export async function GET() {
  if (process.env.SEO_INDEXING_ENABLED === 'false') {
    return new Response(buildUrlsetXml([]), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const routes = getPublicSitemapRoutes();
  const seen = new Set<string>();
  const entries: any[] = [];

  for (const r of routes) {
    const loc = canonicalUrl(r.path);
    if (seen.has(loc)) continue;
    seen.add(loc);

    const verified = getVerifiedLocalePaths(r.path);
    entries.push({
      loc,
      lastmod: RELEASE_TIMESTAMP,
      changefreq: r.changeFrequency || 'weekly',
      priority: r.sitemapPriority || 0.7,
      ...(verified ? {
        alternates: {
          'ko-KR': canonicalUrl(verified.ko),
          'en-US': canonicalUrl(verified.en),
          'ja-JP': canonicalUrl(verified.ja),
          'zh-CN': canonicalUrl(verified.zh),
          'x-default': canonicalUrl(verified.ko),
        },
      } : {}),
    });
  }

  const xml = buildUrlsetXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
