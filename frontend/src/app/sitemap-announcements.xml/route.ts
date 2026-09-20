import { publicApi } from '@/lib/api';
import { buildUrlsetXml, canonicalUrl, type SitemapUrlEntry } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface AnnouncementItem {
  readonly announcementId: string;
  readonly title: string;
  readonly publishedAt: string | null;
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
      loc: canonicalUrl('/announcements'),
      lastmod: now,
      changefreq: 'daily',
      priority: 0.8,
    },
  ];

  try {
    const data = await publicApi<{ announcements: AnnouncementItem[] }>('/api/v1/announcements', 60);
    if (data?.announcements) {
      for (const notice of data.announcements) {
        entries.push({
          loc: canonicalUrl(`/announcements/${notice.announcementId}`),
          lastmod: notice.publishedAt || now,
          changefreq: 'weekly',
          priority: 0.7,
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
