'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BellRing, X } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { parseNotificationFeed, type NotificationItem } from '@/components/notification-feed';

// No public treasury event feed currently verifies payouts against the ledger.
// Only the authenticated, owner-scoped notification API may produce a cue here.
const TREASURY_SUBJECT = /(국고|배당|소각|treasury|dividend|buyback|burn)/i;
const POLL_MS = 60_000;
const MAX_AGE_MS = 15 * 60_000;
const FUTURE_SKEW_MS = 5 * 60_000;

function isRecentTreasuryNotice(item: NotificationItem, now: number): boolean {
  const age = now - Date.parse(item.created_at);
  return item.category === 'TRANSACTIONAL' &&
    !item.is_read &&
    TREASURY_SUBJECT.test(item.title) &&
    age >= -FUTURE_SKEW_MS &&
    age <= MAX_AGE_MS;
}

/**
 * A private notification cue, not a public financial settlement broadcast.
 * The ledger is authoritative; notification delivery alone proves no payout.
 */
export function TreasuryBroadcastToast({ signedIn }: { readonly signedIn: boolean }) {
  const { locale } = useLocale();
  const [notice, setNotice] = useState<NotificationItem | null>(null);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    seen.current.clear();
    setNotice(null);
    if (!signedIn) return;

    let cancelled = false;
    let requestPending = false;

    async function refresh() {
      if (requestPending) return;
      requestPending = true;
      try {
        const response = await fetch('/api/notifications?limit=20&unreadOnly=true', { cache: 'no-store' });
        if (!response.ok) return;
        const items = parseNotificationFeed(await response.json());
        if (cancelled) return;
        const now = Date.now();
        const next = items.find((item) => !seen.current.has(item.id) && isRecentTreasuryNotice(item, now));
        for (const item of items) seen.current.add(item.id);
        if (next) setNotice(next);
      } catch {
        // Unavailable/invalid backend data must never become a synthetic financial claim.
      } finally {
        requestPending = false;
      }
    }

    void refresh();
    const interval = setInterval(() => void refresh(), POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [signedIn]);

  if (!signedIn || !notice) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label={localeLabel(locale, '회원 국고 관련 알림', 'Member treasury-related notice', '会員向け国庫通知', '会员国库相关通知', 'Thông báo kho bạc dành cho thành viên')}
      className="fixed top-16 left-3 right-3 z-50 rounded-xl border border-indigo-500/40 bg-slate-950/95 p-4 text-slate-100 shadow-xl backdrop-blur-md sm:left-auto sm:right-6 sm:w-full sm:max-w-sm"
    >
      <div className="flex items-start gap-3">
        <BellRing aria-hidden="true" className="mt-1 size-5 shrink-0 text-indigo-300" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold text-indigo-300">
            {localeLabel(locale, '서버에 등록된 회원 알림', 'Member notification from server', 'サーバーに登録された会員通知', '服务器登记的会员通知', 'Thông báo thành viên từ máy chủ')}
          </p>
          <p className="break-words text-sm font-semibold">{notice.title}</p>
          <p className="text-xs text-slate-300">
            {localeLabel(locale, '알림은 지급·소각 확정 증빙이 아닙니다. 실제 거래는 지갑에서 확인하세요.', 'A notification is not proof of settlement. Verify transactions in your wallet.', '通知は決済完了の証明ではありません。取引はウォレットで確認してください。', '通知不代表结算已完成，请在钱包中核实交易。', 'Thông báo không chứng minh giao dịch đã hoàn tất. Hãy kiểm tra giao dịch trong ví.')}
          </p>
          <Link href="/account/notifications" className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-indigo-200 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300">
            {localeLabel(locale, '알림함 확인', 'Open notifications', '通知を確認', '查看通知', 'Mở thông báo')}
          </Link>
        </div>
        <button
          type="button"
          aria-label={localeLabel(locale, '알림 닫기', 'Dismiss notice', '通知を閉じる', '关闭通知', 'Đóng thông báo')}
          onClick={() => setNotice(null)}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-300"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </aside>
  );
}
