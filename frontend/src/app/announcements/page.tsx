import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseAnnouncementPinned } from './announcement-pinned';
import { ArrowRight, Image as ImageIcon, Pin } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { publicApi } from '@/lib/api';
import { jsonLd } from '@/lib/json-ld';
import { formatDay } from '@/lib/money';
import { canonicalUrl, breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 60;

const baseMetadata: Metadata = {
  title: '운영 소식',
  description: '월덕 머니버스의 공개된 운영 공지',
  alternates: { canonical: canonicalUrl('/announcements') },
};

type PageProps = { readonly searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const pinnedOnly = parseAnnouncementPinned(await searchParams);
  return pinnedOnly ? { ...baseMetadata, robots: { index: false, follow: false } } : baseMetadata;
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
  const pinnedOnly = parseAnnouncementPinned(await searchParams);
  if (pinnedOnly === null) notFound();
  const data = await publicApi<{ announcements: Announcement[] }>(
    pinnedOnly ? '/api/v1/announcements?pinnedOnly=1' : '/api/v1/announcements',
    pinnedOnly ? 0 : 60,
  );

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

      <form action="/announcements" method="get" className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card p-4">
        <label htmlFor="pinned-only" className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input id="pinned-only" type="checkbox" name="pinnedOnly" value="1" defaultChecked={pinnedOnly} className="size-4" />
          고정 공지만 보기
        </label>
        <button type="submit" className="min-h-11 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground">적용</button>
        {pinnedOnly && <Link href="/announcements" className="inline-flex min-h-11 items-center text-sm underline">전체 보기</Link>}
        <p className="w-full text-xs text-muted-foreground">최근 공개 공지 20건 내에서만 필터링합니다.</p>
      </form>
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
            title={pinnedOnly ? '최근 공지 중 고정된 소식이 없어요.' : '공개된 운영 소식을 준비하고 있어요.'}
            description={pinnedOnly ? '전체 공지에서 다른 소식을 확인해 주세요.' : '검토를 마친 공지부터 이곳에 표시됩니다.'}
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