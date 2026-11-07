import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { publicApi } from '@/lib/api';
import { jsonLd } from '@/lib/json-ld';
import { canonicalUrl, breadcrumbJsonLd } from '@/lib/seo';
import { PinnedNoticeList, type Announcement } from './pinned-notices';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '운영 소식',
  description: '월덕 머니버스의 공개된 운영 공지',
  alternates: { canonical: canonicalUrl('/announcements') },
};

export default async function AnnouncementsPage() {
  const data = await publicApi<{ announcements: Announcement[] }>('/api/v1/announcements', 60);

  const announcementsBreadcrumb = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '운영 소식', path: '/announcements' },
  ]);

  return (
    <div data-page="announcements" className="mv-page mv-page--community grid gap-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(announcementsBreadcrumb) }}
      />
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
        검토를 마친 공지만 이곳에 게시됩니다. 카드를 클릭하면 상세 내용을 볼 수 있어요.
      </PageHeader>

      {/* Structured data for the announcement list */}
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
          <PinnedNoticeList announcements={data.announcements} />
        )}
      </section>

      {/* 스폰서 광고 */}
      <PublicAdvertisement />
    </div>
  );
}
