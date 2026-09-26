import { publicApi } from '@/lib/api';
import { buildUrlsetXml, canonicalUrl, type SitemapUrlEntry } from '@/lib/seo';

export const revalidate = 3600;

const RELEASE_TIMESTAMP = new Date('2026-09-26T21:00:00.000Z').toISOString();

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

  const entries: SitemapUrlEntry[] = [
    {
      loc: canonicalUrl('/announcements'),
      lastmod: RELEASE_TIMESTAMP,
      changefreq: 'daily',
      priority: 0.8,
    },
  ];

  try {
    const data = await publicApi<{ announcements: AnnouncementItem[] }>('/api/v1/announcements', 3600);
    if (data?.announcements) {
      for (const notice of data.announcements) {
        entries.push({
          loc: canonicalUrl(`/announcements/${notice.announcementId}`),
          lastmod: notice.publishedAt || RELEASE_TIMESTAMP,
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
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
