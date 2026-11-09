import { buildSitemapIndexXml, canonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  if (process.env.SEO_INDEXING_ENABLED === 'false') {
    return new Response(buildSitemapIndexXml([]), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const releaseDate = (process.env.APP_RELEASE_DATE ? new Date(process.env.APP_RELEASE_DATE) : new Date('2026-11-08T00:00:00.000Z')).toISOString();
  const sitemaps = [
    { loc: canonicalUrl('/sitemap.xml'), lastmod: releaseDate },
    { loc: canonicalUrl('/sitemap-stocks.xml'), lastmod: releaseDate },
    { loc: canonicalUrl('/sitemap-announcements.xml'), lastmod: releaseDate },
    { loc: canonicalUrl('/sitemap-board.xml'), lastmod: releaseDate },
  ];

  const xml = buildSitemapIndexXml(sitemaps);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
