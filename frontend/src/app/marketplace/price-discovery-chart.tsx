'use client';

import React, { useState } from 'react';
import { TrendingUp, Activity, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { groupDigits } from '@/lib/money';

export interface PricePoint {
  readonly day: string;
  readonly price: number;
  readonly volume: number;
}

interface PriceDiscoveryChartProps {
  readonly itemName?: string;
  readonly rollingMedianWld: string;
  readonly p25Wld: string;
  readonly p75Wld: string;
  readonly volume7dWld: string;
  readonly volume30dWld: string;
  readonly currentListedPrice?: string;
}

export function PriceDiscoveryChart({
  itemName = '전체 거래소 지표',
  rollingMedianWld,
  p25Wld,
  p75Wld,
  volume7dWld,
  volume30dWld,
  currentListedPrice,
}: PriceDiscoveryChartProps) {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  // 7일/30일 추세 샘플 데이터 (결정형 스파크라인)
  const data7d: readonly PricePoint[] = [
    { day: 'D-6', price: 1200, volume: 14 },
    { day: 'D-5', price: 1250, volume: 22 },
    { day: 'D-4', price: 1180, volume: 18 },
    { day: 'D-3', price: 1310, volume: 30 },
    { day: 'D-2', price: 1290, volume: 25 },
    { day: 'D-1', price: 1350, volume: 40 },
    { day: '오늘', price: 1400, volume: 35 },
  ];

  const data30d: readonly PricePoint[] = [
    { day: 'W-4', price: 1050, volume: 110 },
    { day: 'W-3', price: 1150, volume: 140 },
    { day: 'W-2', price: 1280, volume: 185 },
    { day: 'W-1', price: 1340, volume: 220 },
    { day: '이번주', price: 1400, volume: 195 },
  ];

  const activeData = period === '7d' ? data7d : data30d;
  const maxPrice = Math.max(...activeData.map((d) => d.price), 1);
  const minPrice = Math.min(...activeData.map((d) => d.price), 0);
  const priceRange = Math.max(maxPrice - minPrice, 1);

  // SVG 좌표 계산 (너비 320, 높이 60)
  const svgWidth = 320;
  const svgHeight = 60;
  const paddingY = 8;
  const usableHeight = svgHeight - paddingY * 2;

  const points = activeData
    .map((d, index) => {
      const x = (index / (activeData.length - 1)) * svgWidth;
      const y = svgHeight - paddingY - ((d.price - minPrice) / priceRange) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  // 시세 이상 여부 감지 (P75의 1.5배 초과 시 고가 경고, P25의 0.6배 미만 시 저가 주의)
  const currentPriceBig = currentListedPrice ? BigInt(currentListedPrice) : null;
  const p75Big = BigInt(p75Wld || '1');
  const p25Big = BigInt(p25Wld || '1');

  let anomalyState: 'NORMAL' | 'HIGH' | 'LOW' = 'NORMAL';
  if (currentPriceBig) {
    if (currentPriceBig > (p75Big * 150n) / 100n) {
      anomalyState = 'HIGH';
    } else if (currentPriceBig < (p25Big * 60n) / 100n) {
      anomalyState = 'LOW';
    }
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-4">
      {/* 상단 헤더 및 기간 토글 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{itemName}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                기획서 §6 가격발견
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              최근 20건 정상 체결 기준 롤링 중앙값 및 25~75% 공정 시세 밴드
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setPeriod('7d')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              period === '7d'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            7일 추세
          </button>
          <button
            type="button"
            onClick={() => setPeriod('30d')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              period === '30d'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            30일 누적
          </button>
        </div>
      </div>

      {/* 3대 핵심 핀테크 메트릭 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-muted/40 p-3 border border-border/60">
          <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <span>롤링 중앙값</span>
            <HelpCircle className="size-3 text-muted-foreground/60" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-foreground mt-0.5">
            {groupDigits(rollingMedianWld)} <span className="text-xs font-sans font-normal text-muted-foreground">WLD</span>
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 border border-border/60">
          <div className="text-[11px] font-medium text-muted-foreground">공정 시세 밴드 (P25~P75)</div>
          <div className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {groupDigits(p25Wld)} ~ {groupDigits(p75Wld)}
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 border border-border/60">
          <div className="text-[11px] font-medium text-muted-foreground">7일 체결 총액</div>
          <div className="text-sm font-bold font-mono text-foreground mt-1">
            {groupDigits(volume7dWld)} <span className="text-[11px] font-normal text-muted-foreground">WLD</span>
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 border border-border/60">
          <div className="text-[11px] font-medium text-muted-foreground">30일 체결 총액</div>
          <div className="text-sm font-bold font-mono text-foreground mt-1">
            {groupDigits(volume30dWld)} <span className="text-[11px] font-normal text-muted-foreground">WLD</span>
          </div>
        </div>
      </div>

      {/* 실시간 시세 이상 감지 배너 */}
      {anomalyState === 'HIGH' && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            <strong>시세 대비 고가 경고:</strong> 현재 등록 가격이 상위 75% 분위수(P75) 대비 150%를 초과합니다. 신중한 구매 결정을 권장합니다.
          </span>
        </div>
      )}
      {anomalyState === 'LOW' && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
          <ShieldCheck className="size-4 shrink-0" />
          <span>
            <strong>급매/저가 알림:</strong> 현재 등록 가격이 하위 25% 분위수(P25)보다 40% 이상 저렴한 급매 매물입니다.
          </span>
        </div>
      )}

      {/* SVG 체결가 변동 스파크라인 */}
      <div className="relative pt-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span className="flex items-center gap-1">
            <TrendingUp className="size-3 text-emerald-500" />
            체결가 추세 ({period === '7d' ? '최근 7일' : '최근 4주'})
          </span>
          <span className="font-mono text-[10px]">최고 {groupDigits(maxPrice)} WLD</span>
        </div>
        <div className="w-full overflow-hidden rounded-md bg-muted/20 border border-border/40 p-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-14 overflow-visible"
            preserveAspectRatio="none"
          >
            {/* 그리드 가이드라인 */}
            <line
              x1="0"
              y1={paddingY}
              x2={svgWidth}
              y2={paddingY}
              stroke="currentColor"
              strokeDasharray="2 2"
              className="text-border/40"
            />
            <line
              x1="0"
              y1={svgHeight - paddingY}
              x2={svgWidth}
              y2={svgHeight - paddingY}
              stroke="currentColor"
              strokeDasharray="2 2"
              className="text-border/40"
            />

            {/* 추세선 */}
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
              className="text-emerald-500 dark:text-emerald-400"
            />

            {/* 각 데이터 포인트 원 */}
            {activeData.map((d, index) => {
              const x = (index / (activeData.length - 1)) * svgWidth;
              const y = svgHeight - paddingY - ((d.price - minPrice) / priceRange) * usableHeight;
              return (
                <circle
                  key={d.day}
                  cx={x}
                  cy={y}
                  r="3.5"
                  className="fill-background stroke-emerald-500 dark:stroke-emerald-400 stroke-2"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1 px-1">
          {activeData.map((d) => (
            <span key={d.day}>{d.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
