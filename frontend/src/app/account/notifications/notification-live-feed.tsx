'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { markAccountNotificationRead } from './actions';

interface NotificationItem {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly body: string;
  readonly link?: string | null;
  readonly is_read: boolean;
  readonly created_at: string;
}

const categories = [
  ['ALL', '전체'],
  ['TRANSACTIONAL', '거래'],
  ['PRODUCT_ACTIVITY', '서비스'],
  ['SEASON_LIVEOPS', '시즌'],
  ['SECURITY_CRITICAL', '보안'],
  ['SYSTEM', '시스템'],
] as const;

/** A notification's destination must be a relative URL on our own origin. */
export function safeNotificationLink(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) return null;
  try {
    const parsed = new URL(value, 'https://moneyverse.invalid');
    if (parsed.origin !== 'https://moneyverse.invalid') return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

function isNotification(value: unknown): value is NotificationItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && typeof item.category === 'string'
    && typeof item.title === 'string' && typeof item.body === 'string'
    && typeof item.is_read === 'boolean' && typeof item.created_at === 'string';
}

export function NotificationLiveFeed() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=100', { cache: 'no-store', signal });
      if (!response.ok) throw new Error('Notification API unavailable');
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== 'object' || !('notifications' in payload) || !Array.isArray(payload.notifications)
        || !payload.notifications.every(isNotification)) {
        throw new Error('Invalid notification response');
      }
      if (signal?.aborted) return;
      setItems(payload.notifications);
      setLastChecked(new Date());
      setError(false);
    } catch {
      if (!signal?.aborted) setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  async function markRead(notificationId: string | null) {
    if (busy !== null) return;
    setBusy(notificationId ?? 'all');
    try {
      const result = await markAccountNotificationRead(notificationId);
      if (!result.ok) throw new Error('Read update rejected');
      setItems((current) => current.map((item) =>
        notificationId === null || item.id === notificationId ? { ...item, is_read: true } : item));
      await refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }

  const visible = category === 'ALL' ? items : items.filter((item) => item.category === category);
  const unread = items.filter((item) => !item.is_read).length;

  return <section aria-label="내 알림" className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="알림 분류">
        {categories.map(([key, label]) => <button key={key} type="button"
          aria-pressed={category === key} onClick={() => setCategory(key)}
          className={`min-h-11 rounded-lg border px-3 text-sm ${category === key ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
          {label}
        </button>)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => void refresh()} disabled={loading || busy !== null}
          className="min-h-11 rounded-lg border px-3 text-sm"><RefreshCw className="mr-1 inline size-4" aria-hidden="true"/>새로고침</button>
        <button type="button" onClick={() => void markRead(null)} disabled={loading || busy !== null || unread === 0 || error || !lastChecked}
          className="min-h-11 rounded-lg border px-3 text-sm"><CheckCheck className="mr-1 inline size-4" aria-hidden="true"/>모두 읽음 ({unread})</button>
      </div>
    </div>
    {lastChecked && <p className="text-xs text-muted-foreground" role="status">마지막 서버 확인: {lastChecked.toLocaleTimeString('ko-KR')}</p>}
    {error && <div role="alert" className="rounded-lg border border-destructive p-3 text-sm">
      알림을 확인하거나 변경하지 못했습니다. 마지막으로 확인한 목록이 표시될 수 있습니다. 새로고침으로 다시 시도해 주세요.
    </div>}
    {loading && !lastChecked ? <p role="status" className="text-sm">알림을 불러오는 중입니다.</p> : null}
    {!loading && !error && visible.length === 0 ? <p className="rounded-lg border p-6 text-sm text-muted-foreground">표시할 알림이 없습니다.</p> : null}
    <ul className="grid gap-3">
      {visible.map((item) => {
        const href = safeNotificationLink(item.link);
        const date = new Date(item.created_at);
        return <li key={item.id} className={`rounded-xl border p-4 ${item.is_read ? 'bg-muted/20' : 'border-primary/40 bg-primary/5'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Bell className="size-4" aria-hidden="true"/><strong className="text-sm">{item.title}</strong></div>
            <time className="text-xs text-muted-foreground" dateTime={item.created_at}>
              {Number.isNaN(date.getTime()) ? '시간 정보 없음' : date.toLocaleString('ko-KR')}
            </time>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {href && <Link href={href} className="min-h-11 inline-flex items-center rounded-lg border px-3 text-sm">관련 화면으로 이동</Link>}
            {!item.is_read && <button type="button" disabled={busy !== null || error} onClick={() => void markRead(item.id)}
              className="min-h-11 rounded-lg border px-3 text-sm">읽음 처리</button>}
          </div>
        </li>;
      })}
    </ul>
  </section>;
}
