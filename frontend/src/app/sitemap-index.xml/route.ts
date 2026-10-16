import { buildSitemapIndexXml, canonicalUrl } from '@/lib/seo';
import { getAllBlogPosts } from '@/app/blog/blog-data';

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
  const latestBlogModification = getAllBlogPosts().map(post => post.updatedAt).sort().at(-1) ?? '2026-10-15T14:00:00.000Z';
  const sitemaps = [
    { loc: canonicalUrl('/sitemap.xml'), lastmod: now },
    { loc: canonicalUrl('/sitemap-static.xml'), lastmod: now },
    { loc: canonicalUrl('/sitemap-announcements.xml'), lastmod: now },
    { loc: canonicalUrl('/sitemap-board.xml'), lastmod: now },
    { loc: canonicalUrl('/sitemap-stocks.xml'), lastmod: now },
    { loc: canonicalUrl('/sitemap-blog.xml'), lastmod: new Date(latestBlogModification).toISOString() },
  ];

  const xml = buildSitemapIndexXml(sitemaps);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
