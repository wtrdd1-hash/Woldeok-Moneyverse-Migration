import { buildUrlsetXml, canonicalUrl } from '@/lib/seo';
import { getPublicSitemapRoutes } from '@/config/routes.config';

export const revalidate = 3600;

const RELEASE_TIMESTAMP = new Date('2026-09-26T21:00:00.000Z').toISOString();

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
  const entries = routes.map((r) => ({
    loc: canonicalUrl(r.path),
    lastmod: RELEASE_TIMESTAMP,
    changefreq: r.changeFrequency || 'weekly',
    priority: r.sitemapPriority || 0.7,
  }));

  const xml = buildUrlsetXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
