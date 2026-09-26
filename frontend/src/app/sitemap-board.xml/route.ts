import { publicApi } from '@/lib/api';
import { buildUrlsetXml, canonicalUrl, type SitemapUrlEntry } from '@/lib/seo';

export const revalidate = 3600;

const RELEASE_TIMESTAMP = new Date('2026-09-26T21:00:00.000Z').toISOString();

interface PostItem {
  readonly postId: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
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
      loc: canonicalUrl('/board'),
      lastmod: RELEASE_TIMESTAMP,
      changefreq: 'daily',
      priority: 0.8,
    },
  ];

  try {
    const data = await publicApi<{ posts: PostItem[] }>('/api/v1/board/public/stock-posts', 3600);
    if (data?.posts) {
      for (const post of data.posts) {
        entries.push({
          loc: canonicalUrl(`/board/${post.postId}`),
          lastmod: post.updatedAt || post.createdAt || RELEASE_TIMESTAMP,
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
