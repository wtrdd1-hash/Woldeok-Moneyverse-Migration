'use client';

import React, { useMemo, useState } from 'react';
import { groupDigits } from '@/lib/money';
import type { OrderbookRow } from './stock-orderbook';
import { BarChart3 } from 'lucide-react';

interface StockDepthChartProps {
  readonly bids: OrderbookRow[];
  readonly asks: OrderbookRow[];
  readonly livePrice: string;
  readonly isEn?: boolean | undefined;
  readonly onSelectPrice?: ((price: string, side: 'buy' | 'sell') => void) | undefined;
}

export function StockDepthChart({
  bids,
  asks,
  livePrice,
  isEn = false,
  onSelectPrice,
}: StockDepthChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    side: 'bid' | 'ask';
    price: string;
    volume: number;
    cumVolume: number;
  } | null>(null);

  // 차트 렌더링에 필요한 누적 데이터 및 좌표 정규화
  const {
    bidPoints,
    askPoints,
    bidPath,
    askPath,
    maxCumVolume: _maxCumVolume,
    minPrice,
    maxPrice,
    totalBidVolume,
    totalAskVolume,
    largestBidWall,
    largestAskWall,
  } = useMemo(() => {
    // 매수 호가는 현재가(우측)에서 아래로(좌측) 갈수록 누적량이 증가함
    // 매도 호가는 현재가(좌측)에서 위로(우측) 갈수록 누적량이 증가함
    const sortedBids = [...bids].sort((a, b) => Number.parseInt(a.price, 10) - Number.parseInt(b.price, 10)); // 오름차순 (낮은 가격 -> 높은 가격)
    const sortedAsks = [...asks].sort((a, b) => Number.parseInt(a.price, 10) - Number.parseInt(b.price, 10)); // 오름차순 (낮은 가격 -> 높은 가격)

    // Bids 누적 계산 (현재가에 가까운 높은 가격부터 낮은 가격으로 누적)
    let bidCum = 0;
    const bidData = [...sortedBids].reverse().map((b) => {
      bidCum += b.volume;
      return { price: b.price, volume: b.volume, cumVolume: bidCum };
    }).reverse(); // 다시 가격 오름차순으로 정렬

    // Asks 누적 계산 (현재가에 가까운 낮은 가격부터 높은 가격으로 누적)
    let askCum = 0;
    const askData = sortedAsks.map((a) => {
      askCum += a.volume;
      return { price: a.price, volume: a.volume, cumVolume: askCum };
    });

    const totalBids = bidCum;
    const totalAsks = askCum;
    const maxCum = Math.max(totalBids, totalAsks, 100);

    const allPrices = [...bidData.map((d) => Number.parseInt(d.price, 10)), ...askData.map((d) => Number.parseInt(d.price, 10))];
    const minP = allPrices.length > 0 ? Math.min(...allPrices) : 1000;
    const maxP = allPrices.length > 0 ? Math.max(...allPrices) : 2000;

    // SVG 캔버스 규격 (Width: 500, Height: 200, Margin Top: 20, Bottom: 30)
    const W = 500;
    const chartBottom = 165;
    const chartTop = 15;
    const chartHeight = chartBottom - chartTop;

    // 좌측 절반: Bids (0 ~ 245), 우측 절반: Asks (255 ~ 500), 중앙 갭: 245~255
    const midX = 250;

    // Bid Path 생성 (좌측 끝 x=10에서 중앙 x=245로 이동)
    // 가격이 낮을수록 x가 작음 (0 쪽)
    const bPts = bidData.map((d, idx) => {
      const x = 15 + (idx / Math.max(1, bidData.length - 1)) * (midX - 25);
      const y = chartBottom - (d.cumVolume / maxCum) * chartHeight;
      return { x, y, ...d };
    });

    // Ask Path 생성 (중앙 x=255에서 우측 끝 x=485로 이동)
    // 가격이 높을수록 x가 큼 (500 쪽)
    const aPts = askData.map((d, idx) => {
      const x = midX + 10 + (idx / Math.max(1, askData.length - 1)) * (W - midX - 25);
      const y = chartBottom - (d.cumVolume / maxCum) * chartHeight;
      return { x, y, ...d };
    });

    let bPath = '';
    if (bPts.length > 0) {
      const first = bPts[0];
      if (first) {
        bPath = `M ${first.x} ${chartBottom} L ${first.x} ${first.y} `;
        for (let i = 1; i < bPts.length; i++) {
          const pt = bPts[i];
          if (pt) {
            bPath += `L ${pt.x} ${pt.y} `;
          }
        }
        const last = bPts[bPts.length - 1];
        if (last) {
          bPath += `L ${last.x} ${chartBottom} Z`;
        }
      }
    }

    let aPath = '';
    if (aPts.length > 0) {
      const first = aPts[0];
      if (first) {
        aPath = `M ${first.x} ${chartBottom} L ${first.x} ${first.y} `;
        for (let i = 1; i < aPts.length; i++) {
          const pt = aPts[i];
          if (pt) {
            aPath += `L ${pt.x} ${pt.y} `;
          }
        }
        const last = aPts[aPts.length - 1];
        if (last) {
          aPath += `L ${last.x} ${chartBottom} Z`;
        }
      }
    }

    // 가장 큰 단일 호가벽 찾기
    const largestB = [...bids].sort((a, b) => b.volume - a.volume)[0];
    const largestA = [...asks].sort((a, b) => b.volume - a.volume)[0];

    return {
      bidPoints: bPts,
      askPoints: aPts,
      bidPath: bPath,
      askPath: aPath,
      maxCumVolume: maxCum,
      minPrice: minP,
      maxPrice: maxP,
      totalBidVolume: totalBids,
      totalAskVolume: totalAsks,
      largestBidWall: largestB,
      largestAskWall: largestA,
    };
  }, [bids, asks]);

  const bidRatio = Math.round((totalBidVolume / (totalBidVolume + totalAskVolume || 1)) * 100);
  const askRatio = 100 - bidRatio;

  return (
    <div className="space-y-2 select-none">
      {/* 심도 상단 요약 바 */}
      <div className="flex items-center justify-between text-[11px] font-mono px-1">
        <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isEn ? 'Total Bids' : '매수 누적'}</span>
          <span className="tabular-nums">{groupDigits(totalBidVolume.toString())} ({bidRatio}%)</span>
        </div>
        <div className="text-muted-foreground text-[10px]">
          {isEn ? 'Market Depth Visualizer' : '실시간 매수/매도 매물대 심도'}
        </div>
        <div className="flex items-center gap-1.5 text-rose-500 font-bold">
          <span className="tabular-nums">{groupDigits(totalAskVolume.toString())} ({askRatio}%)</span>
          <span>{isEn ? 'Total Asks' : '매도 누적'}</span>
          <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
        </div>
      </div>

      {/* SVG 심도 누적 차트 */}
      <div className="relative w-full rounded-lg border border-border/70 bg-slate-950/80 p-2 overflow-hidden shadow-inner">
        <svg
          viewBox="0 0 500 190"
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* 배경 눈금선 (25%, 50%, 75%) */}
          <line x1="10" y1="52" x2="490" y2="52" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
          <line x1="10" y1="90" x2="490" y2="90" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
          <line x1="10" y1="127" x2="490" y2="127" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />

          {/* 중앙 현재가 기준선 */}
          <line x1="250" y1="10" x2="250" y2="165" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 2" opacity="0.7" />

          {/* Bids 누적 영역 (에메랄드) */}
          {bidPath && (
            <path
              d={bidPath}
              fill="url(#bidGradient)"
              stroke="#10b981"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          )}

          {/* Asks 누적 영역 (로즈) */}
          {askPath && (
            <path
              d={askPath}
              fill="url(#askGradient)"
              stroke="#f43f5e"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          )}

          {/* Bids 인터랙티브 포인트들 */}
          {bidPoints.map((pt) => (
            <circle
              key={`bp-${pt.price}`}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#10b981"
              stroke="#0f172a"
              strokeWidth="1.5"
              className="cursor-pointer hover:r-5 transition-all"
              onClick={() => onSelectPrice?.(pt.price, 'buy')}
              onMouseEnter={() => setHoveredPoint({ side: 'bid', price: pt.price, volume: pt.volume, cumVolume: pt.cumVolume })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Asks 인터랙티브 포인트들 */}
          {askPoints.map((pt) => (
            <circle
              key={`ap-${pt.price}`}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#f43f5e"
              stroke="#0f172a"
              strokeWidth="1.5"
              className="cursor-pointer hover:r-5 transition-all"
              onClick={() => onSelectPrice?.(pt.price, 'sell')}
              onMouseEnter={() => setHoveredPoint({ side: 'ask', price: pt.price, volume: pt.volume, cumVolume: pt.cumVolume })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* 바닥 베이스 라인 */}
          <line x1="10" y1="165" x2="490" y2="165" stroke="#475569" strokeWidth="1" />

          {/* X축 가격 라벨 */}
          <text x="25" y="180" fill="#10b981" fontSize="10" fontFamily="monospace" textAnchor="start">
            {groupDigits(minPrice.toString())}
          </text>
          <text x="250" y="180" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            {groupDigits(livePrice)} WLD
          </text>
          <text x="475" y="180" fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="end">
            {groupDigits(maxPrice.toString())}
          </text>
        </svg>

        {/* 툴팁 오버레이 */}
        {hoveredPoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700/80 rounded-md px-2.5 py-1 text-[11px] font-mono shadow-xl backdrop-blur-md pointer-events-none z-20 flex items-center gap-2">
            <span className={hoveredPoint.side === 'bid' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {hoveredPoint.side === 'bid' ? (isEn ? 'Bid' : '매수') : (isEn ? 'Ask' : '매도')} {groupDigits(hoveredPoint.price)} WLD
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">
              {isEn ? 'Vol' : '단일'}: {groupDigits(hoveredPoint.volume.toString())}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-amber-300 font-semibold">
              {isEn ? 'Cum' : '누적'}: {groupDigits(hoveredPoint.cumVolume.toString())}
            </span>
          </div>
        )}
      </div>

      {/* 하단 최대 호가벽(Order Wall) 인사이트 스트립 */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        {largestBidWall && (
          <div
            onClick={() => onSelectPrice?.(largestBidWall.price, 'buy')}
            className="flex items-center justify-between px-2.5 py-1.5 rounded bg-emerald-950/30 border border-emerald-800/40 cursor-pointer hover:bg-emerald-900/40 transition-colors"
          >
            <div className="flex items-center gap-1 text-emerald-400">
              <BarChart3 className="size-3" />
              <span>{isEn ? 'Max Bid Wall' : '최대 매수벽'}</span>
            </div>
            <div className="text-emerald-300 font-bold tabular-nums">
              {groupDigits(largestBidWall.price)} WLD ({groupDigits(largestBidWall.volume.toString())}주)
            </div>
          </div>
        )}

        {largestAskWall && (
          <div
            onClick={() => onSelectPrice?.(largestAskWall.price, 'sell')}
            className="flex items-center justify-between px-2.5 py-1.5 rounded bg-rose-950/30 border border-rose-800/40 cursor-pointer hover:bg-rose-900/40 transition-colors"
          >
            <div className="flex items-center gap-1 text-rose-400">
              <BarChart3 className="size-3" />
              <span>{isEn ? 'Max Ask Wall' : '최대 매도벽'}</span>
            </div>
            <div className="text-rose-300 font-bold tabular-nums">
              {groupDigits(largestAskWall.price)} WLD ({groupDigits(largestAskWall.volume.toString())}주)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
