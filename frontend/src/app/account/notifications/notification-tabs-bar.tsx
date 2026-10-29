'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Inbox, RefreshCw } from 'lucide-react';
import { parseNotificationFeed, type NotificationItem } from '@/components/notification-feed';

type Category = 'ALL' | 'TRANSACTIONAL' | 'PRODUCT_ACTIVITY' | 'SEASON_LIVEOPS' |
  'SECURITY_CRITICAL' | 'BUSINESS' | 'BANK' | 'SEASON' | 'SPACE' | 'SECURITY' | 'SYSTEM';
const CATEGORIES: ReadonlyArray<{ id: Category; label: string }> = [
  { id: 'ALL', label: '전체' },
  { id: 'TRANSACTIONAL', label: '거래' },
  { id: 'PRODUCT_ACTIVITY', label: '활동' },
  { id: 'SEASON_LIVEOPS', label: '시즌 이벤트' },
  { id: 'SECURITY_CRITICAL', label: '보안 경고' },
  { id: 'BUSINESS', label: '사업' },
  { id: 'BANK', label: '은행' },
  { id: 'SEASON', label: '시즌' },
  { id: 'SPACE', label: '공간' },
  { id: 'SECURITY', label: '보안' },
  { id: 'SYSTEM', label: '시스템' },
];
const PAGE_SIZE = 20;
const actionHeaders = { 'Content-Type': 'application/json', 'X-Moneyverse-Notification-Action': '1' };

export function NotificationTabsBar() {
  const [selectedCat, setSelectedCat] = useState<Category>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const generation = useRef(0);
  const mutationPending = useRef(false);

  async function load(category: Category, unread: boolean, nextOffset: number, append: boolean, requestId: number) {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE + 1), offset: String(nextOffset) });
      if (category !== 'ALL') params.set('category', category);
      if (unread) params.set('unreadOnly', 'true');
      const response = await fetch('/api/notifications?' + params.toString(), { cache: 'no-store' });
      if (!response.ok) throw new Error('feed unavailable');
      const rows = parseNotificationFeed(await response.json());
      if (generation.current !== requestId) return;
      setItems((prev) => append ? [...prev, ...rows.slice(0, PAGE_SIZE)] : rows.slice(0, PAGE_SIZE));
      setOffset(nextOffset + PAGE_SIZE);
      setHasMore(rows.length > PAGE_SIZE && nextOffset + PAGE_SIZE <= 5000);
    } catch {
      if (generation.current !== requestId) return;
      if (!append) setItems([]);
      setError(true);
    } finally {
      if (generation.current === requestId) setLoading(false);
    }
  }

  useEffect(() => {
    const id = ++generation.current;
    setItems([]);
    setOffset(0);
    setHasMore(false);
    setReceipt(null);
    setActionError(false);
    void load(selectedCat, unreadOnly, 0, false, id);
    return () => { generation.current += 1; };
  }, [selectedCat, unreadOnly]);

  const refresh = () => {
    const id = ++generation.current;
    setItems([]);
    setOffset(0);
    setHasMore(false);
    void load(selectedCat, unreadOnly, 0, false, id);
  };

  const markRead = async (notificationId: string) => {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setBusy(true);
    setActionError(false);
    const id = generation.current;
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST', headers: actionHeaders,
        body: JSON.stringify({ notificationId }), cache: 'no-store',
      });
      if (!response.ok || (await response.json())?.read !== true) throw new Error('unverified read');
      if (generation.current === id) {
        setReceipt('서버에서 읽음 처리를 확인했습니다.');
        refresh();
      }
    } catch {
      if (generation.current === id) setActionError(true);
    } finally {
      mutationPending.current = false;
      setBusy(false);
    }
  };

  const markAll = async () => {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setBusy(true);
    setActionError(false);
    const id = generation.current;
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST', headers: actionHeaders,
        body: JSON.stringify({ markAll: true }), cache: 'no-store',
      });
      if (!response.ok) throw new Error('unverified receipt');
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' ||
          !('updatedCount' in data) || !('remainingUnreadCount' in data) ||
          !Number.isSafeInteger(data.updatedCount) || (data.updatedCount as number) < 0 ||
          !Number.isSafeInteger(data.remainingUnreadCount) || (data.remainingUnreadCount as number) < 0) {
        throw new Error('unverified receipt');
      }
      if (generation.current === id) {
        setReceipt(`서버에서 읽음 처리 ${data.updatedCount}건을 확인했습니다. 남은 읽지 않은 알림: ${data.remainingUnreadCount}건.`);
        refresh();
      }
    } catch {
      if (generation.current === id) setActionError(true);
    } finally {
      mutationPending.current = false;
      setBusy(false);
    }
  };

  return (
    <section aria-label="서버 확인 알림 내역" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-b pb-3" role="group" aria-label="알림 분류">
        <button type="button" aria-pressed={unreadOnly} onClick={() => {
          // Fence any in-flight page before changing the owner-visible filter.
          generation.current += 1;
          setUnreadOnly((current) => !current);
        }} className={`min-h-11 rounded-xl border px-3 text-sm ${unreadOnly ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
          읽지 않은 알림만 보기
        </button>
        {CATEGORIES.map(({ id, label }) => (
          <button key={id} type="button" aria-pressed={selectedCat === id}
            onClick={() => setSelectedCat(id)}
            className={`min-h-11 rounded-xl border px-3 text-sm ${selectedCat === id ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
            {id === 'ALL' ? <Bell className="mr-1 inline size-4" aria-hidden="true" /> : null}{label}
          </button>
        ))}
        <button type="button" onClick={() => void markAll()} disabled={busy || loading || error || items.length === 0}
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm disabled:opacity-50">
          <CheckCheck className="size-4" aria-hidden="true" />모두 읽음 처리
        </button>
      </div>
      <div role="status" aria-live="polite" className="text-sm">
        {loading ? '알림을 확인하는 중입니다.' : null}
        {error ? <span>알림을 불러오지 못했습니다. <button type="button" className="underline" onClick={refresh}>다시 시도</button></span> : null}
        {actionError ? <span>읽음 처리에 실패했습니다. 상태를 변경하지 않았습니다.</span> : null}
        {receipt ? <span>{receipt}</span> : null}
      </div>
      {!loading && !error && items.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          <Inbox className="mb-2 size-8" aria-hidden="true" />해당 분류의 알림 내역이 없습니다.
        </div>
      ) : null}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.category} · {new Date(item.created_at).toLocaleString('ko-KR')}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm">{item.body}</p>
            {!item.is_read ? (
              <button type="button" disabled={busy} onClick={() => void markRead(item.id)}
                aria-label={`${item.title} · 읽지 않음 · 읽음 처리`}
                className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm disabled:opacity-50">
                <CheckCheck className="size-4" aria-hidden="true" />읽음 처리
              </button>
            ) : <span className="mt-2 block text-xs text-muted-foreground">읽음</span>}
          </li>
        ))}
      </ul>
      {hasMore && !error ? (
        <button type="button" disabled={busy || loading} onClick={() => {
          const id = ++generation.current;
          void load(selectedCat, unreadOnly, offset, true, id);
        }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm disabled:opacity-50">
          <RefreshCw className="size-4" aria-hidden="true" />이전 알림 더 보기
        </button>
      ) : null}
    </section>
  );
}
