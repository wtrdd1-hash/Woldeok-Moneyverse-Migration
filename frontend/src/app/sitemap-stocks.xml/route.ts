import { buildUrlsetXml, canonicalUrl, type SitemapUrlEntry } from '@/lib/seo';

export const revalidate = 3600;

const RELEASE_TIMESTAMP = new Date('2026-10-11T23:00:00.000Z').toISOString();

/**
 * 18 Canonical Virtual Stock Symbols (10 Classic + 8 WDX Listed) for SEO Crawling.
 */
const STOCK_SYMBOLS = [
  'WDG',
  'CHIMU314',
  'WDM',
  'WDB',
  'WDT',
  'MYUY',
  'CHIPS',
  'DUCK',
  'WFIN',
  'SPACE',
  'WDX-TEC',
  'WDX-FIN',
  'WDX-RET',
  'WDX-LOG',
  'WDX-BIO',
  'WDX-ENT',
  'WDX-ENG',
  'WDX-DEF',
] as const;

export async function GET() {
  if (process.env.SEO_INDEXING_ENABLED === 'false') {
    return new Response(buildUrlsetXml([]), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const entries: SitemapUrlEntry[] = [
    {
      loc: canonicalUrl('/stocks'),
      lastmod: RELEASE_TIMESTAMP,
      changefreq: 'daily',
      priority: 0.95,
      alternates: {
        'ko-KR': canonicalUrl('/stocks'),
        'en-US': canonicalUrl('/en/stocks'),
        'ja-JP': canonicalUrl('/ja/stocks'),
        'zh-CN': canonicalUrl('/zh/stocks'),
        'x-default': canonicalUrl('/stocks'),
      },
    },
  ];

  for (const symbol of STOCK_SYMBOLS) {
    const cleanPath = `/stocks/${encodeURIComponent(symbol)}`;
    entries.push({
      loc: canonicalUrl(cleanPath),
      lastmod: RELEASE_TIMESTAMP,
      changefreq: 'daily',
      priority: 0.9,
      alternates: {
        'ko-KR': canonicalUrl(cleanPath),
        'en-US': canonicalUrl(`/en${cleanPath}`),
        'ja-JP': canonicalUrl(`/ja${cleanPath}`),
        'zh-CN': canonicalUrl(`/zh${cleanPath}`),
        'x-default': canonicalUrl(cleanPath),
      },
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
