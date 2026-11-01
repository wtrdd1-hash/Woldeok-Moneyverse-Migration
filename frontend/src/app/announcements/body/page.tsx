import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { publicApi } from '@/lib/api';
import { parseAnnouncementBodyFilter } from '@/lib/announcement-body';
import { formatDay } from '@/lib/money';
import { canonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '공지 본문 검색',
  alternates: { canonical: canonicalUrl('/announcements') },
  robots: { index: false, follow: true },
};

type PageProps = {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type Notice = {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly publishedAt: string | null;
};

export default async function AnnouncementBodyResults({ searchParams }: PageProps) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value !== undefined) query.append(key, value);
  }
  const filter = parseAnnouncementBodyFilter(query);
  if (!filter?.body) notFound();
  const body = filter.body;
  const data = await publicApi<{ announcements: Notice[] }>(
    `/api/v1/announcements?body=${encodeURIComponent(body)}`, 0,
  );

  return (
    <main className="mv-page mv-page--community grid gap-5" data-page="announcement-body-results">
      <PageHeader eyebrow="COMMUNITY NOTICE" title="공지 본문 검색">
        최근 공개 공지 최대 20건의 본문에서만 검색합니다. 전체 과거 공지 검색이 아닙니다.
      </PageHeader>
      <form role="search" method="get" action="/announcements/body"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border/50 bg-card p-4">
        <label htmlFor="notice-body-search" className="grid min-w-0 flex-1 gap-1 text-sm font-semibold">
          검색할 본문 단어
          <input id="notice-body-search" name="body" type="search" maxLength={80} required
            defaultValue={body} className="min-h-11 rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <button type="submit" className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground">검색</button>
        <Link href="/announcements" className="inline-flex min-h-11 items-center text-sm underline">전체 공지 보기</Link>
      </form>
      <section aria-labelledby="body-results-title" className="grid gap-3">
        <h2 id="body-results-title" className="text-lg font-bold">검색 결과</h2>
        {data === null ? (
          <EmptyState title="공지 검색 결과를 불러올 수 없어요." description="잠시 후 다시 시도해 주세요." />
        ) : data.announcements.length === 0 ? (
          <EmptyState title="최근 공지 20건에서 일치하는 본문이 없어요." description="다른 단어로 다시 검색해 주세요." />
        ) : (
          <ul className="grid gap-3">
            {data.announcements.map((notice) => (
              <li key={notice.announcementId}>
                <Link href={`/announcements/${notice.announcementId}`}
                  className="block rounded-xl border border-border/50 bg-card p-5 hover:border-amber-500/50 focus-visible:outline focus-visible:outline-2">
                  <h3 className="font-bold">{notice.title}</h3>
                  {notice.publishedAt ? <time dateTime={notice.publishedAt} className="mt-1 block text-xs text-muted-foreground">{formatDay(notice.publishedAt, '게시일 확인 중')}</time> : null}
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{notice.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
