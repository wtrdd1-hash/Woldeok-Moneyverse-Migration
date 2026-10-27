'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Clock, Sparkles, TrendingUp, Zap, ChevronRight, Coins, Briefcase } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { parseHotTimeEvidence } from '@/lib/hot-time-evidence';

export interface HotTimeBuffItem {
  readonly id: string;
  readonly buffKey: string;
  readonly title: string;
  readonly description: string;
  readonly multiplier: number;
  readonly targetDomain: string;
  readonly active: boolean;
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface HotTimePayload {
  readonly activeBuffs: readonly HotTimeBuffItem[];
  readonly hasActiveHotTime: boolean;
  readonly serverTime: string;
}

export function LiveHotTimeBanner({ domainFilter }: { readonly domainFilter?: string }) {
  const { locale } = useLocale();
  const [buffs, setBuffs] = useState<HotTimeBuffItem[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 72,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchBuffs() {
      try {
        const res = await fetch('/app-api/v1/economy/hot-time/active', { cache: 'no-store' });
        if (res.ok) {
          const data = parseHotTimeEvidence(await res.json() as unknown);
          if (isMounted) {
            setBuffs(data?.activeBuffs ? [...data.activeBuffs] : []);
            setLoaded(true);
          }
        } else if (isMounted) {
          setBuffs([]);
          setLoaded(true);
        }
      } catch {
        if (isMounted) {
          setBuffs([]);
          setLoaded(true);
        }
      }
    }
    fetchBuffs();

    return () => {
      isMounted = false;
    };
  }, []);

  // 남은 시간 실시간 1초 주기 틱
  useEffect(() => {
    const target = domainFilter
      ? buffs.find((b) => b.targetDomain === domainFilter || b.targetDomain === 'all')
      : buffs[0];
    const targetTime = target ? Date.parse(target.endsAt) : Date.now();

    function updateTimer() {
      const diff = Math.max(0, targetTime - Date.now());
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [buffs, domainFilter]);

  const filteredBuffs = buffs.filter((b) =>
    b.active && Date.parse(b.endsAt) > Date.now() &&
    (!domainFilter || b.targetDomain === domainFilter || b.targetDomain === 'all')
  );

  if (!loaded || filteredBuffs.length === 0) {
    return null;
  }

  const current: HotTimeBuffItem = filteredBuffs[0]!;
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="w-full max-w-full min-w-0 my-3 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-orange-500/10 p-3 sm:p-4 shadow-sm backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        {/* 왼쪽: 핫타임 인디케이터 및 혜택 정보 */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-xs">
            <Flame className="size-5 sm:size-5.5 animate-pulse text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-[10px] tracking-wide uppercase shrink-0 shadow-xs">
                <Zap className="size-3 fill-current" />
                {localeLabel(locale, '실시간 골든 핫타임', 'LIVE HOT-TIME', 'リアルタイムホットタイム', '实时热力时间')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px] shrink-0">
                {current.multiplier > 1.0 ? `+${Math.round((current.multiplier - 1) * 100)}% BOOST` : 'FEE FREE'}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400/90 font-bold shrink-0">
                <Clock className="size-3 text-amber-400" />
                <span>
                  {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
                </span>
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight mt-1 truncate max-w-full">
              {current.title}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 [word-break:keep-all]">
              {current.description}
            </p>
          </div>
        </div>

        {/* 오른쪽: 빠른 바로가기 버튼 */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Link
            href={current.targetDomain === 'stocks' ? '/stocks' : '/work'}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 px-3.5 py-1.5 text-xs font-bold text-zinc-950 shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <span>{localeLabel(locale, '버프 혜택 받기', 'Claim Buff', 'バフを受け取る', '领取加成')}</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
