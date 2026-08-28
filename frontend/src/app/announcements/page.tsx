import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { publicApi } from '@/lib/api';
import { jsonLd } from '@/lib/json-ld';
import { formatDay } from '@/lib/money';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '운영 소식',
  description: '월덕 머니버스의 공개된 운영 공지',
  alternates: { canonical: '/announcements' },
};

interface Announcement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly publishedAt: string | null;
}

export default async function AnnouncementsPage() {
  const data = await publicApi<{ announcements: Announcement[] }>('/api/v1/announcements', 60);

  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="COMMUNITY NOTICE"
        title={
          <>
            우리 세계의
            <br />
            <Accent>새로운 소식.</Accent>
          </>
        }
      >
        검토를 마친 공지만 이곳에 게시됩니다.
      </PageHeader>

      {/* Structured data for the announcement list. Only emitted when there is
          something published — describing an empty list to a crawler is noise. */}
      {data && data.announcements.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
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

      <section aria-labelledby="notice-list-title" className="grid gap-3">
        <SectionHeader
          eyebrow="PUBLISHED NOTICE"
          title="공지사항"
          id="notice-list-title"
          action={
            <Link href="/status" className="shrink-0 text-sm font-extrabold text-clay-ink">
              현재 상태 보기 →
            </Link>
          }
        />
        {data === null ? (
          // Offline is not the same as empty, and the page says which.
          <EmptyState
            title="지금은 공지를 불러올 수 없어요."
            description="잠시 후 다시 확인해 주세요."
          />
        ) : data.announcements.length === 0 ? (
          <EmptyState
            title="공개된 운영 소식을 준비하고 있어요."
            description="검토를 마친 공지부터 이곳에 표시됩니다."
          />
        ) : (
          data.announcements.map((notice) => (
            <Card key={notice.announcementId} className="gap-4">
              <CardHeader>
                  {notice.publishedAt && (
                    <time
                      dateTime={notice.publishedAt}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDay(notice.publishedAt, '게시 시간 확인 중')}
                    </time>
                  )}
                <CardTitle className="text-lg">{notice.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{notice.body}</p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
