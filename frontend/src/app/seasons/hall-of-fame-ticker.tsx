'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Crown,
  Sparkles,
  ChevronRight,
  X,
  Medal,
  History,
  ShieldAlert,
} from 'lucide-react';
import { groupDigits } from '@/lib/money';

interface LegendRecord {
  readonly rank: number;
  readonly name: string;
  readonly title: string;
  readonly score: number;
  readonly contributionWld: number;
  readonly seasonTag: string;
  readonly date: string;
}

const HALL_OF_FAME_LEGENDS: LegendRecord[] = [
  {
    rank: 1,
    name: '골든불 (GoldenBull)',
    title: '시즌 1 초대 수도의 총독 (Governor)',
    score: 1_280_000,
    contributionWld: 12_800_000,
    seasonTag: 'Season 1: First Capital',
    date: '2026.08',
  },
  {
    rank: 2,
    name: '월스트리트호랑이 (WSTiger)',
    title: '시즌 1 최고 재무관 (Chancellor)',
    score: 940_000,
    contributionWld: 9_400_000,
    seasonTag: 'Season 1: First Capital',
    date: '2026.08',
  },
  {
    rank: 3,
    name: '네오머니 (NeoMoney)',
    title: '시즌 1 개척 대사 (Pioneer Envoy)',
    score: 820_000,
    contributionWld: 8_200_000,
    seasonTag: 'Season 1: First Capital',
    date: '2026.08',
  },
  {
    rank: 4,
    name: '사이버상단 (CyberMerchant)',
    title: '초대 물류 독점관 (Trade Baron)',
    score: 650_000,
    contributionWld: 6_500_000,
    seasonTag: 'Season 1: First Capital',
    date: '2026.08',
  },
  {
    rank: 5,
    name: '비트하모니 (BitHarmony)',
    title: '공공 인프라 기여왕 (Public Benefactor)',
    score: 510_000,
    contributionWld: 5_100_000,
    seasonTag: 'Season 1: First Capital',
    date: '2026.08',
  },
];

export function SeasonHallOfFameTicker() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-yellow-500/10 p-3 sm:p-4 shadow-sm backdrop-blur-md">
        {/* 샴페인 골드 앰비언트 글로우 */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-amber-500/15 blur-2xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* 좌측 배지 */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <Crown className="size-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block leading-tight">
                HALL OF FAME TICKER
              </span>
              <span className="text-xs font-black text-foreground">
                시즌 1 명예의 전당 헌액자
              </span>
            </div>
          </div>

          {/* 중앙 롤링 티커 (CSS 마키 효과) */}
          <div className="relative flex-1 overflow-hidden py-1 px-2 mx-1 sm:mx-3 bg-background/50 rounded-xl border border-amber-500/20">
            <div className="flex items-center gap-8 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
              {HALL_OF_FAME_LEGENDS.map((legend) => (
                <div key={legend.rank} className="inline-flex items-center gap-2 text-xs">
                  <span
                    className={`font-black font-mono px-1.5 py-0.5 rounded text-[10px] ${
                      legend.rank === 1
                        ? 'bg-amber-500 text-slate-950'
                        : legend.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : legend.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    #{legend.rank}
                  </span>
                  <span className="font-bold text-foreground">{legend.name}</span>
                  <span className="text-muted-foreground text-[11px]">{legend.title}</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {groupDigits(legend.score.toString())} pt
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                </div>
              ))}
            </div>
          </div>

          {/* 우측 전당 열기 버튼 */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-300 transition-all hover:bg-amber-500/25 active:scale-95"
          >
            <Trophy className="size-3.5" />
            <span>명예의 전당 기록관</span>
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>

      {/* 명예의 전당 모달 팝업 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-card p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* 상단 골드 글로우 */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl" />

            {/* 모달 헤더 */}
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-inner">
                  <Trophy className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      FIRST CAPITAL ARCHIVE
                    </span>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300">
                      영구 불멸 헌액록
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-foreground mt-0.5">
                    시즌 1: 최초의 수도 명예의 전당
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-border/80 p-2 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* 시즌 1 서머리 배너 */}
            <div className="my-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">시즌 1 누적 WLD 소각량 (Hard Sink)</p>
                <p className="text-xl font-black font-mono text-amber-500 mt-0.5">
                  14,850,000 WLD 완전 소각
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <History className="size-4 text-amber-500" />
                <span>헌액 확정일: 2026년 8월 31일</span>
              </div>
            </div>

            {/* 헌액자 랭킹 리스트 */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {HALL_OF_FAME_LEGENDS.map((legend) => (
                <div
                  key={legend.rank}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                    legend.rank === 1
                      ? 'border-amber-500/50 bg-amber-500/10 shadow-sm'
                      : legend.rank === 2
                        ? 'border-slate-400/40 bg-slate-400/5'
                        : legend.rank === 3
                          ? 'border-amber-700/40 bg-amber-700/5'
                          : 'border-border/60 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl font-mono font-black text-sm border ${
                        legend.rank === 1
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : legend.rank === 2
                            ? 'bg-slate-300 text-slate-950 border-slate-200'
                            : legend.rank === 3
                              ? 'bg-amber-700 text-white border-amber-600'
                              : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {legend.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{legend.name}</span>
                        <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/50">
                          {legend.seasonTag}
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                        {legend.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
                    <span className="text-xs font-mono font-black text-foreground">
                      {groupDigits(legend.score.toString())} PT
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      소각 기여: {groupDigits(legend.contributionWld.toString())} WLD
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 모달 하단 푸터 */}
            <div className="mt-4 border-t border-border/60 pt-4 flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" />
                명예의 전당 기록은 분기별 시즌 종료 시 자동 동결 보존됩니다.
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-border/80 px-4 py-2 text-xs font-bold text-foreground hover:bg-muted active:scale-95"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
