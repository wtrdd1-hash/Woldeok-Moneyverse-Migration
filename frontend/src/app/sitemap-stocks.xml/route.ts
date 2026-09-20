import { apiOrNull } from '@/lib/api';
import { buildUrlsetXml, canonicalUrl, type SitemapUrlEntry } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface StockItem {
  readonly symbol: string;
}

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
  const entries: SitemapUrlEntry[] = [
    {
      loc: canonicalUrl('/stocks'),
      lastmod: now,
      changefreq: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const data = await apiOrNull<{ stocks: StockItem[] }>('/api/v1/stocks');
    if (data?.stocks) {
      for (const stock of data.stocks) {
        entries.push({
          loc: canonicalUrl(`/stocks/${encodeURIComponent(stock.symbol)}`),
          lastmod: now,
          changefreq: 'daily',
          priority: 0.8,
        });
      }
    }
  } catch {
    // Graceful fallback to list page
  }

  const xml = buildUrlsetXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
