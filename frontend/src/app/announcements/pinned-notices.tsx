'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Image as ImageIcon, Pin } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { formatDay } from '@/lib/money';

export interface Announcement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
  readonly isPinned?: boolean;
  readonly publishedAt: string | null;
}

export function pinnedNotices(
  announcements: readonly Announcement[],
  pinnedOnly: boolean,
): readonly Announcement[] {
  return pinnedOnly ? announcements.filter((notice) => notice.isPinned === true) : announcements;
}

export function PinnedNoticeList({
  announcements,
}: {
  readonly announcements: readonly Announcement[];
}) {
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const visible = pinnedNotices(announcements, pinnedOnly);
  return (
    <>
      <nav aria-label="공지사항 표시 필터" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!pinnedOnly}
          onClick={() => setPinnedOnly(false)}
          className={`min-h-11 rounded-md border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring ${!pinnedOnly ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
        >
          전체 공지
        </button>
        <button
          type="button"
          aria-pressed={pinnedOnly}
          onClick={() => setPinnedOnly(true)}
          className={`min-h-11 rounded-md border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring ${pinnedOnly ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
        >
          고정 공지만
        </button>
      </nav>
      <p className="text-xs text-muted-foreground">
        최근 공개된 공지 최대 20건 안에서만 필터링합니다.
      </p>
      {visible.length === 0 ? (
        <EmptyState
          title="최근 공지 중 고정된 공지가 없어요."
          description="전체 공지로 돌아가 다른 운영 소식을 확인해 주세요."
        />
      ) : (
        visible.map((notice) => (
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
                    <time
                      dateTime={notice.publishedAt}
                      className="text-xs text-muted-foreground font-mono"
                    >
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
                  {notice.isPinned && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      고정 공지
                    </Badge>
                  )}
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
    </>
  );
}
