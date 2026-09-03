import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { publicApi } from '@/lib/api';
import { jsonLd } from '@/lib/json-ld';
import { formatDay } from '@/lib/money';

export const revalidate = 60;

interface Announcement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
  readonly publishedAt: string | null;
}

interface PageProps {
  readonly params: Promise<{ announcementId: string }>;
}

async function getAnnouncement(id: string) {
  const data = await publicApi<{ announcements: Announcement[] }>('/api/v1/announcements', 60);
  if (!data?.announcements) return null;
  const current = data.announcements.find((item) => item.announcementId === id);
  const others = data.announcements.filter((item) => item.announcementId !== id).slice(0, 3);
  return { current: current ?? null, others };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { announcementId } = await params;
  const data = await getAnnouncement(announcementId);
  if (!data?.current) {
    return { title: '공지사항을 찾을 수 없습니다' };
  }

  const notice = data.current;
  return {
    title: `${notice.title} · 월덕 머니버스`,
    description: notice.body.slice(0, 150),
    alternates: { canonical: `/announcements/${notice.announcementId}` },
    openGraph: {
      title: `${notice.title} — 월덕 머니버스`,
      description: notice.body.slice(0, 150),
      images: notice.imageUrl ? [{ url: notice.imageUrl }] : undefined,
    },
    twitter: {
      card: notice.imageUrl ? 'summary_large_image' : 'summary',
      title: notice.title,
      description: notice.body.slice(0, 150),
      images: notice.imageUrl ? [notice.imageUrl] : undefined,
    },
  };
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { announcementId } = await params;
  const data = await getAnnouncement(announcementId);

  if (!data?.current) {
    notFound();
  }

  const { current: notice, others } = data;

  return (
    <div className="mx-auto max-w-3xl grid gap-8">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between">
        <Link
          href="/announcements"
          className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 text-amber-500" />
          <span>운영 소식 목록으로</span>
        </Link>
        {notice.publishedAt && (
          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-surface/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Calendar className="size-3.5 text-amber-500" />
            <time dateTime={notice.publishedAt}>{formatDay(notice.publishedAt)}</time>
          </div>
        )}
      </div>

      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: notice.title,
            datePublished: notice.publishedAt,
            image: notice.imageUrl ? [notice.imageUrl] : undefined,
            description: notice.body.slice(0, 200),
          }),
        }}
      />

      {/* 메인 상세 본문 카드 */}
      <article className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm">
        <div className="border-b border-border/40 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-black text-amber-600 dark:text-amber-400">
              OFFICIAL NOTICE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-snug">
            {notice.title}
          </h1>
        </div>

        {/* 첨부 이미지 */}
        {notice.imageUrl && (
          <div className="my-6 overflow-hidden rounded-2xl border border-border/40 bg-surface/30">
            <img
              src={notice.imageUrl}
              alt={notice.imageAltText || notice.title}
              className="w-full max-h-[560px] object-contain rounded-2xl shadow-sm"
            />
          </div>
        )}

        {/* 본문 줄글 */}
        <div className="mt-6 whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-foreground/90 font-normal">
          {notice.body}
        </div>
      </article>

      {/* 다른 공지사항 추천 */}
      {others.length > 0 && (
        <section aria-labelledby="other-notices-title" className="grid gap-3 pt-4">
          <h2 id="other-notices-title" className="text-sm font-bold tracking-tight text-muted-foreground">
            다른 최근 소식
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {others.map((other) => (
              <Link
                key={other.announcementId}
                href={`/announcements/${other.announcementId}`}
                className="group flex flex-col justify-between rounded-xl border border-border/40 bg-surface/30 p-4 transition-all hover:border-amber-500/40 hover:shadow-sm"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>{formatDay(other.publishedAt)}</span>
                  <span className="text-amber-500 font-bold group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  {other.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 하단 스폰서 광고 */}
      <PublicAdvertisement />
    </div>
  );
}