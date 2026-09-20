import { buildUrlsetXml, canonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const STATIC_PATHS = [
  '',
  '/guide',
  '/announcements',
  '/gallery',
  '/shop',
  '/casino',
  '/stocks',
  '/quests',
  '/businesses',
  '/board',
  '/terms',
  '/privacy',
  '/account-deletion',
  '/data-deletion',
];

export async function GET() {
  if (process.env.SEO_INDEXING_ENABLED === 'false') {
    return new Response(buildUrlsetXml([]), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const now = new Date().toISOString();
  const entries = STATIC_PATHS.map((path) => ({
    loc: canonicalUrl(path),
    lastmod: now,
    changefreq: path === '' ? ('daily' as const) : ('weekly' as const),
    priority: path === '' ? 1.0 : path === '/casino' || path === '/stocks' ? 0.9 : 0.7,
  }));

  const xml = buildUrlsetXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
