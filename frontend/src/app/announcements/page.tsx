import type { Metadata } from 'next';
import { Plate, Unavailable } from '@/components/ui/plate';
import { publicApi } from '@/lib/api';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '운영 소식',
  description: '월덕 머니버스의 공개된 운영 공지',
  alternates: { canonical: '/announcements' },
};

interface Announcement {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly publishedAt: string;
}

export default async function AnnouncementsPage() {
  const data = await publicApi<{ announcements: Announcement[] }>('/api/v1/announcements', 60);

  return (
    <div className="grid gap-4">
      <h1 className="pt-4 text-2xl font-bold">운영 소식</h1>

      {/* Structured data for the announcement list. Only emitted when there is
          something published — describing an empty list to a crawler is noise. */}
      {data && data.announcements.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: data.announcements.map((notice, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'NewsArticle',
                  headline: notice.title,
                  datePublished: notice.publishedAt,
                },
              })),
            }),
          }}
        />
      )}

      {data === null ? (
        // Offline is not the same as empty, and the page says which.
        <Unavailable>지금은 공지를 불러올 수 없어요. 잠시 후 다시 확인해 주세요.</Unavailable>
      ) : data.announcements.length === 0 ? (
        <Unavailable>공개된 운영 소식을 준비하고 있어요.</Unavailable>
      ) : (
        data.announcements.map((notice) => (
          <Plate as="article" key={notice.id}>
            <time dateTime={notice.publishedAt} className="text-xs text-[var(--muted)]">
              {new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(
                new Date(notice.publishedAt),
              )}
            </time>
            <h2 className="mt-1 text-lg font-medium">{notice.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">{notice.body}</p>
          </Plate>
        ))
      )}
    </div>
  );
}
