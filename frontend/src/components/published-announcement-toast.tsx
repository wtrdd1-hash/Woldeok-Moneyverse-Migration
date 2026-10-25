'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Bell, X } from 'lucide-react';

interface PublishedNotice {
  readonly announcementId: string;
  readonly title: string;
  readonly publishedAt: string;
}

const POLL_MS = 60_000;
const CLOCK_SKEW_MS = 30_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validNotices(value: unknown): PublishedNotice[] | null {
  if (!value || typeof value !== 'object' || !('announcements' in value)) return null;
  const rows = value.announcements;
  if (!Array.isArray(rows) || rows.length > 20) return null;

  const parsed: PublishedNotice[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') return null;
    const item = row as Record<string, unknown>;
    if (
      typeof item.announcementId !== 'string' ||
      !UUID.test(item.announcementId) ||
      typeof item.title !== 'string' ||
      !item.title.trim() ||
      item.title.length > 160 ||
      typeof item.publishedAt !== 'string'
    ) return null;
    const published = Date.parse(item.publishedAt);
    if (!Number.isFinite(published) || published > Date.now() + 2 * 60_000) return null;
    parsed.push({
      announcementId: item.announcementId,
      title: item.title,
      publishedAt: item.publishedAt,
    });
  }
  return parsed;
}

/**
 * Shows only newly published, server-backed announcements.
 * Financial treasury transactions have no public verified broadcast contract;
 * a timer must never impersonate an executed WLD ledger transaction.
 */
export function PublishedAnnouncementToast() {
  const [current, setCurrent] = useState<PublishedNotice | null>(null);

  useEffect(() => {
    const mountedAt = Date.now();
    let active = true;
    let inFlight = false;
    let knownIds: Set<string> | null = null;

    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch('/api/content/announcements', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok) return;
        const notices = validNotices(await response.json());
        if (!active || !notices) return;

        if (knownIds === null) {
          // A first successful read is a baseline, not a new publication event.
          knownIds = new Set(notices.map((notice) => notice.announcementId));
          return;
        }

        const fresh = notices
          .filter((notice) => !knownIds!.has(notice.announcementId))
          .filter((notice) => Date.parse(notice.publishedAt) >= mountedAt - CLOCK_SKEW_MS)
          .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
        knownIds = new Set(notices.map((notice) => notice.announcementId));
        if (fresh[0]) setCurrent(fresh[0]);
      } catch {
        // Network failure is not evidence of a new announcement.
      } finally {
        inFlight = false;
      }
    }

    void refresh();
    const interval = window.setInterval(() => void refresh(), POLL_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => setCurrent(null), 8_000);
    return () => window.clearTimeout(timer);
  }, [current]);

  if (!current) return null;

  return createPortal(
    <aside
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="새로 게시된 공지"
      className="fixed left-3 right-3 top-16 z-50 sm:left-auto sm:right-6 sm:w-full sm:max-w-sm"
    >
      <div className="flex items-start gap-3 border border-border bg-background p-3 shadow-xl sm:p-4">
        <Bell className="mt-2 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground">새 운영 공지</p>
          <Link
            href={`/announcements/${encodeURIComponent(current.announcementId)}`}
            className="mt-1 inline-flex min-h-11 items-center break-words text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {current.title}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setCurrent(null)}
          aria-label="공지 닫기"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </aside>,
    document.body,
  );
}
