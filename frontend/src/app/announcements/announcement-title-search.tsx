'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Image as ImageIcon, Pin } from 'lucide-react';
import { formatDay } from '@/lib/money';

export interface SearchableAnnouncement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
  readonly isPinned?: boolean;
  readonly publishedAt: string | null;
}

export function AnnouncementTitleSearch({ announcements }: { announcements: readonly SearchableAnnouncement[] }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLocaleLowerCase();
  const visible = announcements.filter((notice) => notice.title.toLocaleLowerCase().includes(term));
  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-border/60 bg-card p-4 grid gap-2">
        <label htmlFor="announcement-title-query" className="text-sm font-semibold">공지 제목 검색</label>
        <input id="announcement-title-query" type="search" value={query}
          onChange={(event) => setQuery(event.target.value)} maxLength={80}
          placeholder="제목으로 찾기" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" />
        <p className="text-xs text-muted-foreground">최근 공개 공지 최대 50개에서 제목을 검색합니다. 전체 공지 기록 검색은 아닙니다.</p>
        <p role="status" aria-live="polite" className="text-xs text-muted-foreground">검색 결과 {visible.length}개</p>
      </div>
      {visible.length === 0 && <p className="rounded-xl border p-4 text-sm text-muted-foreground">일치하는 공지가 없습니다.</p>}
      {visible.map((notice) => (
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
          ))}
    </div>
  );
}
