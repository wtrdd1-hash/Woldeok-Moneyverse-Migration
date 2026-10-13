'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react';
import { playStockTickSound } from '@/lib/audio-effects';

export interface TreasuryBroadcastEvent {
  readonly id: string;
  readonly type: 'DIVIDEND_PAYOUT' | 'BUYBACK_BURN' | 'BUDGET_PASSED' | 'GRANT_APPROVED';
  readonly title: string;
  readonly message: string;
  readonly amountWldText?: string;
  readonly timestamp: number;
}

export function TreasuryBroadcastToast() {
  const [currentEvent, setCurrentEvent] = useState<TreasuryBroadcastEvent | null>(null);

  useEffect(() => {
    // 30초~60초 주기로 생동감 있는 국고 실시간 환원 및 소각 브로드캐스트 시뮬레이션
    const mockBroadcasts: TreasuryBroadcastEvent[] = [
      {
        id: 'bc-1',
        type: 'DIVIDEND_PAYOUT',
        title: '🎉 정기 시민 기본배당 국고 집행 완료!',
        message: '활성 시민 1,420명에게 총 1,704,000 WLD가 균등 지급되었습니다.',
        amountWldText: '1,704,000 WLD',
        timestamp: Date.now(),
      },
      {
        id: 'bc-2',
        type: 'BUYBACK_BURN',
        title: '🔥 거시경제 디플레이션 바이백 소각!',
        message: '인플레이션 억제를 위해 시장 WLD 150,000개가 영구 소각되었습니다.',
        amountWldText: '150,000 WLD',
        timestamp: Date.now(),
      },
      {
        id: 'bc-3',
        type: 'BUDGET_PASSED',
        title: '🏛️ 주민참여예산 공공사업 1,000표 달성 통과!',
        message: '시민 투표 1,120표를 얻은 신규 클럽 공공 인프라 부스트가 승인되었습니다.',
        amountWldText: '500,000 WLD',
        timestamp: Date.now(),
      },
    ];

    let timerId: NodeJS.Timeout;

    const scheduleNext = () => {
      // 45초 후 무작위 브로드캐스트 트리거
      timerId = setTimeout(() => {
        const randomEvt = mockBroadcasts[Math.floor(Math.random() * mockBroadcasts.length)];
        if (randomEvt) {
          setCurrentEvent({ ...randomEvt, id: `bc-${Date.now()}` });
          try {
            playStockTickSound();
          } catch {
            // Audio context failure guard
          }
        }
        scheduleNext();
      }, 45000);
    };

    scheduleNext();

    return () => clearTimeout(timerId);
  }, []);

  // 토스트 6초 후 자동 닫힘
  useEffect(() => {
    if (!currentEvent) return;
    const hideTimer = setTimeout(() => {
      setCurrentEvent(null);
    }, 6000);
    return () => clearTimeout(hideTimer);
  }, [currentEvent]);

  if (!currentEvent) return null;

  const isBurn = currentEvent.type === 'BUYBACK_BURN';

  return (
    <aside
      aria-label="국고 실시간 환원 및 소각 알림"
      className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 select-none ${
          isBurn
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-100'
            : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-100'
        }`}
      >
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isBurn ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-300'
          }`}
        >
          {isBurn ? <Flame className="size-5" /> : <Sparkles className="size-5" />}
        </div>

        <div className="flex-1 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-xs leading-none">
              {currentEvent.title}
            </span>
            <button
              type="button"
              onClick={() => setCurrentEvent(null)}
              className="text-muted-foreground hover:text-foreground rounded p-0.5"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed font-sans">
            {currentEvent.message}
          </p>
          {currentEvent.amountWldText && (
            <div className="font-mono text-[11px] font-bold text-primary tabular-nums pt-0.5 flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-400" />
              <span>국고 총 집행: {currentEvent.amountWldText}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
