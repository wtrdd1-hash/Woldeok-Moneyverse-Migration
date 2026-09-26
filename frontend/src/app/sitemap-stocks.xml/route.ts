import { buildUrlsetXml, canonicalUrl, type SitemapUrlEntry } from '@/lib/seo';

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

  // Only the public stock exchange overview hub is indexable by guest search crawlers.
  // Individual stock trading consoles (/stocks/[symbol]) are protected by requireMember()
  // and must NOT be submitted to sitemap to avoid crawler 307 redirect indexing penalties.
  const entries: SitemapUrlEntry[] = [
    {
      loc: canonicalUrl('/stocks'),
      lastmod: RELEASE_TIMESTAMP,
      changefreq: 'daily',
      priority: 0.9,
    },
  ];

  const xml = buildUrlsetXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
