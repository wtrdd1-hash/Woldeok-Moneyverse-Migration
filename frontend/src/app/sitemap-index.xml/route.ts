import { buildSitemapIndexXml, canonicalUrl } from '@/lib/seo';
import { getAllBlogPosts } from '@/app/blog/blog-data';
import { verifiedPublicArticles } from '@/app/blog/blog-verified-client';
import { isBlogDiscoverable } from '@/app/blog/blog-seo';

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

  // Unknown modification time must be omitted rather than fabricated on every GET.
  const updated = [...await verifiedPublicArticles(), ...getAllBlogPosts()]
    .filter(isBlogDiscoverable)
    .map(post => post.updatedAt)
    .filter(date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date) && Number.isFinite(Date.parse(date)))
    .sort();
  const latestBlogModification = updated.at(-1);
  const sitemaps = [
    { loc: canonicalUrl('/sitemap.xml') },
    { loc: canonicalUrl('/sitemap-static.xml') },
    { loc: canonicalUrl('/sitemap-announcements.xml') },
    { loc: canonicalUrl('/sitemap-board.xml') },
    { loc: canonicalUrl('/sitemap-stocks.xml') },
    { loc: canonicalUrl('/sitemap-blog.xml'), ...(latestBlogModification ? { lastmod: new Date(latestBlogModification).toISOString() } : {}) },
  ];

  const xml = buildSitemapIndexXml(sitemaps);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
