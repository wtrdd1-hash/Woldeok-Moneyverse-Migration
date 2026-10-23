'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Clock, Inbox, RefreshCw } from 'lucide-react';
import { parseNotificationFeed, type NotificationItem } from '@/components/notification-feed';

const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  TRANSACTIONAL: '송금·거래',
  PRODUCT_ACTIVITY: '서비스 활동',
  SEASON_LIVEOPS: '시즌·이벤트',
  SECURITY_CRITICAL: '보안·인증',
  SYSTEM: '시스템',
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? '기타';
}

async function postRead(payload: { notificationId: string } | { markAll: true }): Promise<unknown> {
  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Moneyverse-Notification-Action': '1' },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Read receipt unavailable');
  return response.json();
}

/**
 * The account inbox must show the same actor-scoped DB receipts as the header
 * notification center. A local sample feed can falsely assert money movement.
 */
export function NotificationTabsBar() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [actionError, setActionError] = useState(false);
  const [mutating, setMutating] = useState(false);
  const requestId = useRef(0);
  const mutationPending = useRef(false);

  const loadFeed = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    try {
      const response = await fetch('/api/notifications?limit=50', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Feed unavailable');
      const verified = parseNotificationFeed(await response.json());
      if (id === requestId.current) {
        setItems(verified);
        setStatus('ready');
      }
    } catch {
      if (id === requestId.current) {
        setItems([]);
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    void loadFeed();
    return () => { requestId.current += 1; };
  }, [loadFeed]);

  const markOneRead = async (id: string) => {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setMutating(true);
    setActionError(false);
    try {
      const receipt = await postRead({ notificationId: id });
      if (!receipt || typeof receipt !== 'object' || !('read' in receipt) || receipt.read !== true) {
        throw new Error('Invalid read receipt');
      }
      setItems((current) => current.map((item) =>
        item.id === id ? { ...item, is_read: true } : item));
    } catch {
      setActionError(true);
    } finally {
      mutationPending.current = false;
      setMutating(false);
    }
  };

  const markAllRead = async () => {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setMutating(true);
    setActionError(false);
    try {
      const receipt = await postRead({ markAll: true });
      const count = receipt && typeof receipt === 'object' && 'updatedCount' in receipt
        ? receipt.updatedCount : null;
      if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
        throw new Error('Invalid read-all receipt');
      }
      // The DB read-all function operates on this member's entire inbox.
      // A zero update against an older local snapshot needs a fresh read.
      if (count === 0 && items.some((item) => !item.is_read)) {
        await loadFeed();
      } else {
        setItems((current) => current.map((item) => ({ ...item, is_read: true })));
      }
    } catch {
      setActionError(true);
    } finally {
      mutationPending.current = false;
      setMutating(false);
    }
  };

  const categories = Array.from(new Set(items.map((item) => item.category)));
  const filtered = items.filter((item) => selectedCat === 'ALL' || item.category === selectedCat);
  const unreadCount = items.filter((item) => !item.is_read).length;

  return (
    <section aria-label="회원 알림 내역" className="grid min-w-0 gap-4">
      <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div aria-label="알림 분류" className="flex min-w-0 gap-2 overflow-x-auto pb-1">
          {[{ id: 'ALL', label: '전체' }, ...categories.map((id) => ({
            id, label: categoryLabel(id),
          }))].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={selectedCat === id}
              onClick={() => setSelectedCat(id)}
              className="min-h-11 shrink-0 rounded-xl border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={status !== 'ready' || mutating || unreadCount === 0}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold disabled:opacity-50"
        >
          <CheckCheck aria-hidden="true" className="size-4" />
          모두 읽음
        </button>
      </div>
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {status === 'loading' ? '알림을 불러오는 중입니다.' :
          status === 'error' ? '알림 개수를 확인할 수 없습니다.' :
            `현재 목록 미확인 ${unreadCount}건 · 최근 50건까지 표시`}
      </p>
      {actionError && <p role="alert" className="text-sm text-destructive">
        읽음 처리에 실패했습니다. 목록을 새로고침한 후 다시 시도해 주세요.
      </p>}
      {status === 'error' ? (
        <div role="alert" className="grid justify-items-center gap-3 rounded-xl border p-6 text-center">
          <p>알림을 불러오지 못했습니다. 알림이 없다는 의미는 아닙니다.</p>
          <button type="button" onClick={() => void loadFeed()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4">
            <RefreshCw aria-hidden="true" className="size-4" /> 다시 시도
          </button>
        </div>
      ) : status === 'ready' && filtered.length === 0 ? (
        <div className="grid justify-items-center gap-2 rounded-xl border border-dashed p-8 text-center">
          <Inbox aria-hidden="true" className="size-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">알림 내역이 없습니다.</p>
        </div>
      ) : status === 'ready' ? (
        <ul className="grid min-w-0 gap-3">
          {filtered.map((item) => (
            <li key={item.id} className="min-w-0 rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-muted-foreground">{categoryLabel(item.category)}</span>
                  <p className="break-words font-semibold">{item.title}</p>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{item.body}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock aria-hidden="true" className="size-3" />
                    <time dateTime={item.created_at}>
                      {new Date(item.created_at).toLocaleString('ko-KR')}
                    </time>
                  </p>
                </div>
                {item.is_read ? (
                  <span className="text-xs text-muted-foreground">읽음</span>
                ) : (
                  <button type="button" disabled={mutating}
                    onClick={() => void markOneRead(item.id)}
                    className="min-h-11 shrink-0 rounded-lg border px-3 text-xs font-semibold disabled:opacity-50"
                    aria-label={`${item.title} 읽음 처리`}>
                    <Bell aria-hidden="true" className="mr-1 inline size-4" /> 읽음 처리
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
