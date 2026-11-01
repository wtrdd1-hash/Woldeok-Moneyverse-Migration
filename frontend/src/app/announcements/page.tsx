import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Image as ImageIcon, Pin } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { publicApi } from '@/lib/api';
import { isVerifiedAnnouncementDayResponse, parseAnnouncementDay } from '@/lib/announcement-day';
import { jsonLd } from '@/lib/json-ld';
import { formatDay } from '@/lib/money';
import { canonicalUrl, breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 60;

const baseMetadata: Metadata = {
  title: '운영 소식',
  description: '월덕 머니버스의 공개된 운영 공지',
  alternates: { canonical: canonicalUrl('/announcements') },
};

type PageProps = { searchParams: Promise<{ day?: string | string[] }> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { day } = await searchParams;
  return day === undefined ? baseMetadata : {
    ...baseMetadata,
    robots: { index: false, follow: false },
  };
}

interface Announcement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
  readonly isPinned?: boolean;
  readonly publishedAt: string | null;
}

export default async function AnnouncementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const day = parseAnnouncementDay(params.day);
  const invalidDay = params.day !== undefined && day === null;
  const fetched = invalidDay
    ? null
    : await publicApi<{ announcements: Announcement[]; publicationDay?: string }>(
        day ? `/api/v1/announcements?day=${encodeURIComponent(day)}` : '/api/v1/announcements',
        day ? 0 : 60,
      );
  const data = invalidDay
    ? { announcements: [] as Announcement[] }
    : day && fetched && !isVerifiedAnnouncementDayResponse(fetched, day) ? null : fetched;

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
        <form action="/announcements" method="get" role="search" className="flex flex-wrap items-end gap-3 rounded-xl border border-border/50 bg-card p-4">
          <div className="grid gap-1.5">
            <label htmlFor="announcement-day" className="text-sm font-semibold">게시일 (한국시간)</label>
            <input
              id="announcement-day"
              name="day"
              type="date"
              min="2000-01-01"
              max="2099-12-31"
              defaultValue={day ?? ''}
              className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <button type="submit" className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground">
            날짜 검색
          </button>
          {params.day !== undefined && (
            <Link href="/announcements" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold underline underline-offset-4">
              검색 초기화
            </Link>
          )}
          <p className="w-full text-xs text-muted-foreground">
            최근 공개 공지 최대 20건에서만 검색합니다. 이전 공지 전체를 검색하지는 않습니다.
          </p>
        </form>
        {invalidDay ? (
          <p role="alert" className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
            올바른 게시일을 선택해 주세요.
          </p>
        ) : data === null ? (
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
            <Link
              key={notice.announcementId}
              href={`/announcements/${notice.announcementId}`}
              className={`group block rounded-2xl border p-5 sm:p-6 transition-all hover:border-amber-500/50 hover:shadow-md active:scale-[0.99] ${
                notice.isPinned
                  ? 'border-amber-500/50 bg-amber-500/5 shadow-sm ring-1 ring-amber-500/20'
                  : 'border-border/50 bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Pin className="size-3 fill-amber-500 text-amber-600 dark:text-amber-400" />
                        상단 고정
                      </span>
                    )}
                    {notice.publishedAt && (
                      <time dateTime={notice.publishedAt} className="text-xs text-muted-foreground font-mono">
                        {formatDay(notice.publishedAt, '게시 시간 확인 중')}
                      </time>
                    )}
                    {notice.imageUrl && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <ImageIcon className="size-3" />
                        사진 첨부
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    {notice.isPinned && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">고정 공지</Badge>}
                    <span>{notice.title}</span>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {notice.body}
                  </p>
                </div>
                {notice.imageUrl && (
                  <div className="hidden sm:block size-20 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-surface/50">
                    <img
                      src={notice.imageUrl}
                      alt={notice.imageAltText || notice.title}
                      className="size-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                <span>자세히 보기</span>
                <ArrowRight className="size-3.5" />
              </div>
            </Link>
          ))
        )}
      </section>

      {/* 스폰서 광고 */}
      <PublicAdvertisement />
    </div>
  );
}