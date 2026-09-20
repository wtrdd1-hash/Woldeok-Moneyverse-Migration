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

  const now = new Date().toISOString();
  const sitemaps = [
    { loc: canonicalUrl('/sitemap.xml'), lastmod: now },
    { loc: canonicalUrl('/sitemap-static.xml'), lastmod: now },
    { loc: canonicalUrl('/sitemap-announcements.xml'), lastmod: now },
    { loc: canonicalUrl('/sitemap-board.xml'), lastmod: now },
    { loc: canonicalUrl('/sitemap-stocks.xml'), lastmod: now },
  ];

  const xml = buildSitemapIndexXml(sitemaps);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
