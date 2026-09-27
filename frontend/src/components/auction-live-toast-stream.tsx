'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Gavel,
  Crown,
  Sparkles,
  Flame,
  Wifi,
  WifiOff,
  Radio,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export interface LiveBidEvent {
  readonly id: string;
  readonly auctionId: string;
  readonly itemTitle: string;
  readonly itemRarity: 'mythic' | 'legendary' | 'epic' | 'rare';
  readonly bidAmount: number;
  readonly bidderName: string;
  readonly isPlusUser?: boolean;
  readonly timestamp: string;
}

const SAMPLE_INITIAL_BIDS: readonly LiveBidEvent[] = [
  {
    id: 'bid-1',
    auctionId: 'auc-1',
    itemTitle: '황금 호가창 네온 테마',
    itemRarity: 'mythic',
    bidAmount: 76000,
    bidderName: 'CryptoWhale',
    isPlusUser: true,
    timestamp: '방금 전',
  },
  {
    id: 'bid-2',
    auctionId: 'auc-2',
    itemTitle: '다이아몬드 핸즈 프로필 뱃지',
    itemRarity: 'legendary',
    bidAmount: 33000,
    bidderName: '여의도마스터',
    isPlusUser: false,
    timestamp: '1분 전',
  },
  {
    id: 'bid-3',
    auctionId: 'auc-3',
    itemTitle: '[전설] 시장을 뒤흔드는 자',
    itemRarity: 'legendary',
    bidAmount: 19000,
    bidderName: '골드핸즈',
    isPlusUser: true,
    timestamp: '2분 전',
  },
];

export function AuctionLiveToastStream() {
  const [toasts, setToasts] = useState<readonly LiveBidEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'offline'>('connected');

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addBidToast = useCallback((bid: LiveBidEvent) => {
    setToasts((prev) => [bid, ...prev.slice(0, 3)]); // Keep max 4 toasts
    setTimeout(() => {
      removeToast(bid.id);
    }, 4500);
  }, [removeToast]);

  // Listen to custom window auction events or periodic pulse
  useEffect(() => {
    const handleCustomBid = (event: Event) => {
      const custom = event as CustomEvent<LiveBidEvent>;
      if (custom.detail) {
        addBidToast(custom.detail);
      }
    };

    window.addEventListener('auction:bid-placed', handleCustomBid);

    // Periodic simulation pulse for lively live feeling (every 18-28 seconds)
    const interval = setInterval(() => {
      const mockItems: Array<{ title: string; rarity: LiveBidEvent['itemRarity']; base: number }> = [
        { title: '황금 호가창 네온 테마 (1기 한정)', rarity: 'mythic', base: 78000 },
        { title: '다이아몬드 핸즈 움직이는 뱃지', rarity: 'legendary', base: 34000 },
        { title: '[전설] 시장을 뒤흔드는 자 칭호', rarity: 'legendary', base: 20000 },
        { title: '7일 연속 스트릭 복구 골드 프리즈', rarity: 'epic', base: 9000 },
      ];
      const selected = mockItems[Math.floor(Math.random() * mockItems.length)] ?? {
        title: '황금 호가창 네온 테마 (1기 한정)',
        rarity: 'mythic' as const,
        base: 78000,
      };
      const bidders = ['불패의트레이더', 'CryptoWhale', '도파민파머', '덕이서포터', '나스닥헌터'];
      const bidder = bidders[Math.floor(Math.random() * bidders.length)] ?? '트레이더';
      const isPlus = Math.random() > 0.4;
      const increment = Math.floor(Math.random() * 5 + 1) * 1000;

      const newBid: LiveBidEvent = {
        id: `bid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        auctionId: 'auc-live',
        itemTitle: selected.title,
        itemRarity: selected.rarity,
        bidAmount: selected.base + increment,
        bidderName: bidder,
        isPlusUser: isPlus,
        timestamp: '방금 전',
      };

      addBidToast(newBid);
    }, 22000);

    return () => {
      window.removeEventListener('auction:bid-placed', handleCustomBid);
      clearInterval(interval);
    };
  }, [addBidToast]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2.5 sm:right-6"
    >
      {toasts.map((toast) => {
        const burnAmount = Math.floor(toast.bidAmount * 0.05);

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border border-amber-500/40 bg-slate-900/95 p-3.5 text-slate-100 shadow-2xl shadow-amber-500/10 backdrop-blur-md transition-all duration-300 animate-in fade-in-50 slide-in-from-top-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/50 bg-amber-500/20 text-amber-400 shadow-sm">
                <Gavel className="size-4.5 animate-bounce" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-amber-400">⚡ 실시간 신규 입찰</span>
                  {toast.isPlusUser && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/50 bg-amber-500/20 px-1.5 py-0 text-[10px] font-extrabold text-amber-300"
                    >
                      <Crown className="mr-0.5 size-2.5" />
                      PLUS VIP
                    </Badge>
                  )}
                </div>

                <p className="line-clamp-1 text-xs font-bold text-white">{toast.itemTitle}</p>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-black text-amber-400">
                    {toast.bidAmount.toLocaleString()} WLD
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">by {toast.bidderName}</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                  <Flame className="size-3" />
                  <span>5% 소각: -{burnAmount.toLocaleString()} WLD</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 60fps Live Bidding Ticker Strip for Auction Page Top Header
 */
export function AuctionLiveTickerStrip() {
  const [bids] = useState<readonly LiveBidEvent[]>(SAMPLE_INITIAL_BIDS);
  const [status, setStatus] = useState<'connected' | 'reconnecting' | 'offline'>('connected');

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs shadow-inner backdrop-blur-sm">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex items-center gap-1.5 font-bold text-amber-400 shrink-0">
          <Radio className="size-3.5 animate-pulse text-rose-500" />
          <span>LIVE 입찰 티커:</span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto text-[11px] text-slate-300 scrollbar-none">
          {bids.map((b) => (
            <div key={b.id} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-bold text-white">{b.itemTitle}</span>
              <span className="font-mono font-bold text-amber-400">
                {b.bidAmount.toLocaleString()} WLD
              </span>
              <span className="text-slate-400">({b.bidderName})</span>
              <span className="text-slate-600">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* WebSocket Status Indicator */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={cn(
            'flex size-2 rounded-full',
            status === 'connected' && 'bg-emerald-500 animate-pulse',
            status === 'reconnecting' && 'bg-amber-500 animate-ping',
            status === 'offline' && 'bg-rose-500',
          )}
        />
        <span className="font-mono text-[11px] font-bold text-slate-400">
          {status === 'connected' ? '소켓 연결됨 (60fps)' : '재연결 중...'}
        </span>
      </div>
    </div>
  );
}
