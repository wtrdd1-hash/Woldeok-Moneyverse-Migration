'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Inbox, RefreshCw, ShieldAlert } from 'lucide-react';
import { parseNotificationFeed, type NotificationItem } from '@/components/notification-feed';

type Category = 'ALL' | 'TRANSACTIONAL' | 'PRODUCT_ACTIVITY' | 'SEASON_LIVEOPS' | 'SECURITY_CRITICAL' | 'SYSTEM' | 'OTHER';
const CATEGORIES: ReadonlyArray<{ id: Category; label: string }> = [
  { id: 'ALL', label: '전체' },
  { id: 'TRANSACTIONAL', label: '거래 안내' },
  { id: 'PRODUCT_ACTIVITY', label: '서비스 활동' },
  { id: 'SEASON_LIVEOPS', label: '시즌·이벤트' },
  { id: 'SECURITY_CRITICAL', label: '보안' },
  { id: 'SYSTEM', label: '시스템' },
  { id: 'OTHER', label: '기타' },
];
const knownCategories = new Set<string>(CATEGORIES.map(({ id }) => id));

function belongsTo(item: NotificationItem, category: Category): boolean {
  return category === 'ALL' || (category === 'OTHER'
    ? !knownCategories.has(item.category)
    : item.category === category);
}

/** Notifications are announcements, not ledger-backed financial receipts. */
function hasUnverifiedFinancialClaim(item: NotificationItem): boolean {
  return item.category === 'TRANSACTIONAL' || /WLD|₩|\d[\d,]*\s*원|정산|소각|이자|지급|송금|입금|출금|수령|보상|잔액|수익|이체/i.test(`${item.title} ${item.body}`);
}

export function NotificationTabsBar() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedCat, setSelectedCat] = useState<Category>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [pending, setPending] = useState(false);
  const requestId = useRef(0);
  const mutationPending = useRef(false);

  const loadNotifications = useCallback(async (): Promise<NotificationItem[] | null> => {
    const currentRequest = ++requestId.current;
    setStatus('loading');
    try {
      const response = await fetch('/api/notifications?limit=50', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Notification feed unavailable');
      const verified = parseNotificationFeed(await response.json());
      if (currentRequest === requestId.current) {
        setItems(verified);
        setStatus('ready');
      }
      return currentRequest === requestId.current ? verified : null;
    } catch {
      if (currentRequest === requestId.current) {
        setItems([]);
        setStatus('error');
      }
      return null;
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    return () => { requestId.current += 1; };
  }, [loadNotifications]);

  const markRead = async (notificationId?: string) => {
    if (mutationPending.current || status !== 'ready') return;
    mutationPending.current = true;
    requestId.current += 1; // Fence any older feed response from overwriting a confirmed read.
    setPending(true);
    setActionError(false);
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'X-Moneyverse-Notification-Action': '1' },
        body: JSON.stringify(notificationId ? { notificationId } : { markAll: true }),
      });
      if (!response.ok) throw new Error('Read receipt unavailable');
      const receipt: unknown = await response.json();
      if (!receipt || typeof receipt !== 'object') throw new Error('Invalid receipt');
      if (notificationId) {
        if (!('read' in receipt) || receipt.read !== true) throw new Error('Invalid read receipt');
      } else {
        const count = 'updatedCount' in receipt ? receipt.updatedCount : null;
        if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) throw new Error('Invalid read-all receipt');
      }
      const previouslyUnread = items.filter((item) => !item.is_read).map((item) => item.id);
      const refreshed = await loadNotifications();
      if (!refreshed || (notificationId && !refreshed.some((item) => item.id === notificationId && item.is_read)) ||
        (!notificationId && previouslyUnread.some((id) => !refreshed.some((item) => item.id === id && item.is_read)))) {
        throw new Error('Readback unavailable');
      }
    } catch {
      setActionError(true);
    } finally {
      mutationPending.current = false;
      setPending(false);
    }
  };

  const unreadCount = items.filter((item) => !item.is_read).length;
  const filteredItems = items.filter((item) => belongsTo(item, selectedCat) && (!unreadOnly || !item.is_read));

  return (
    <section className="space-y-4" aria-labelledby="notification-inbox-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="notification-inbox-title" className="flex items-center gap-2 text-lg font-semibold"><Bell aria-hidden="true" className="size-5" />최근 알림</h2>
          <p className="text-xs text-muted-foreground">서버에서 확인된 최근 최대 50건입니다. 알림은 금융 정산 영수증이나 보상 수령 증명이 아닙니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setActionError(false); void loadNotifications(); }} disabled={pending || status === 'loading'} className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"><RefreshCw aria-hidden="true" className="size-4" />새로고침</button>
          <button type="button" onClick={() => void markRead()} disabled={pending || status !== 'ready' || unreadCount === 0} className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"><CheckCheck aria-hidden="true" className="size-4" />모두 읽음 ({unreadCount})</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="알림 분류">
        {CATEGORIES.map(({ id, label }) => (
          <button key={id} type="button" aria-pressed={selectedCat === id} onClick={() => setSelectedCat(id)} className={`min-h-11 rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selectedCat === id ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>{label}</button>
        ))}
        <button type="button" aria-pressed={unreadOnly} onClick={() => setUnreadOnly((value) => !value)} className={`min-h-11 rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${unreadOnly ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>미확인만</button>
      </div>

      <div aria-live="polite" role="status" className="text-xs text-muted-foreground">
        {status === 'loading' ? '서버에서 알림을 확인하는 중입니다.' : status === 'ready' ? `표시된 알림 ${items.length}건 · 미확인 ${unreadCount}건` : '알림 조회 실패'}
      </div>
      {actionError && <p role="alert" className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive">읽음 상태를 확인하지 못했습니다. 서버 기록을 다시 확인해 주세요.</p>}
      {status === 'error' ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border p-5">
          <p>알림을 불러오지 못했습니다. 알림이 없다는 의미는 아닙니다.</p>
          <button type="button" onClick={() => { setActionError(false); void loadNotifications(); }} className="min-h-11 rounded-lg border px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">다시 시도</button>
        </div>
      ) : status === 'ready' && filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center"><Inbox aria-hidden="true" className="size-7 text-muted-foreground" /><p className="text-sm">알림 내역이 없습니다.</p></div>
      ) : status === 'ready' ? (
        <ul className="grid gap-3">
          {filteredItems.map((item) => {
            const financial = hasUnverifiedFinancialClaim(item);
            const displayTitle = financial ? '금융 관련 알림' : item.title;
            return (
              <li key={item.id} className={`min-w-0 rounded-xl border p-4 ${item.is_read ? 'bg-card/60' : 'border-primary/40 bg-primary/5'}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="break-words text-sm font-semibold">{displayTitle}</h3>
                  <time dateTime={item.created_at} className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString('ko-KR')}</time>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.category} · {item.is_read ? '읽음' : '미확인'}</p>
                {financial ? (
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2"><ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />금융 관련 안내입니다. 실제 금액·정산 여부는 지갑 거래 내역에서 확인하세요.</p>
                    <Link href="/wallet/activity" className="inline-flex min-h-11 items-center rounded-lg underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">지갑 거래 내역 확인</Link>
                  </div>
                ) : <p className="mt-2 break-words text-sm text-muted-foreground">{item.body}</p>}
                {!item.is_read && <button type="button" onClick={() => void markRead(item.id)} disabled={pending} className="mt-3 min-h-11 rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50" aria-label={`읽음 처리: ${displayTitle}`}>읽음 처리</button>}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
