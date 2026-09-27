'use client';

import React, { useMemo, useState } from 'react';

export interface BidHistoryPoint {
  readonly id: string;
  readonly price: number;
  readonly bidderName: string;
  readonly isPlusUser?: boolean;
  readonly isProxy?: boolean;
  readonly timestamp: string;
}

export interface DepthTier {
  readonly price: number;
  readonly cumulativeVolume: number;
  readonly bidCount: number;
}

interface AuctionDepthChartProps {
  readonly currentBid: number;
  readonly startPrice: number;
  readonly buyNowPrice?: number | null;
  readonly bids?: readonly BidHistoryPoint[];
  readonly itemName?: string;
  readonly themeClass?: string;
  readonly onQuickBid?: (amount: number) => void;
}

export function AuctionDepthChart({
  currentBid,
  startPrice,
  buyNowPrice,
  bids = [],
  itemName = '경매 아티팩트',
  themeClass = '',
  onQuickBid,
}: AuctionDepthChartProps) {
  const [activeTab, setActiveTab] = useState<'ticks' | 'depth'>('ticks');
  const [hoveredPoint, setHoveredPoint] = useState<BidHistoryPoint | null>(null);

  // Generate ticks data from props or generate realistic tick curve
  const points: BidHistoryPoint[] = useMemo(() => {
    if (bids.length > 0) return [...bids];

    // Fallback baseline points from start to current
    const res: BidHistoryPoint[] = [];
    const stepCount = Math.max(4, Math.min(8, Math.round((currentBid - startPrice) / 200) || 5));
    const priceDiff = currentBid - startPrice;

    for (let i = 0; i <= stepCount; i++) {
      const progress = i / stepCount;
      const price = Math.round(startPrice + priceDiff * Math.pow(progress, 1.2));
      res.push({
        id: `mock-tick-${i}`,
        price,
        bidderName: i === stepCount ? '최고 입찰자' : `입찰자_${i + 1}`,
        isPlusUser: i % 2 === 0,
        isProxy: i === stepCount - 1,
        timestamp: new Date(Date.now() - (stepCount - i) * 180000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
    return res;
  }, [bids, currentBid, startPrice]);

  // Generate simulated Depth curve (Buy bid orders)
  const depthTiers: DepthTier[] = useMemo(() => {
    const tiers: DepthTier[] = [];
    const base = currentBid;
    let volumeAcc = 1;

    for (let i = 0; i < 5; i++) {
      const price = Math.round(base * (1 - i * 0.05));
      volumeAcc += Math.round(1 + i * 1.5);
      tiers.push({
        price,
        cumulativeVolume: volumeAcc,
        bidCount: i + 1,
      });
    }
    return tiers;
  }, [currentBid]);

  // SVG Chart Dimensions
  const width = 360;
  const height = 140;
  const padding = 20;

  const minPrice = Math.min(...points.map((p) => p.price), startPrice * 0.95);
  const maxPrice = Math.max(...points.map((p) => p.price), buyNowPrice || currentBid * 1.1);

  const getX = (index: number) => {
    if (points.length <= 1) return width / 2;
    return padding + (index / (points.length - 1)) * (width - padding * 2);
  };

  const getY = (price: number) => {
    if (maxPrice === minPrice) return height / 2;
    const ratio = (price - minPrice) / (maxPrice - minPrice);
    return height - padding - ratio * (height - padding * 2);
  };

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.price)}`)
      .join(' ');
  }, [points, minPrice, maxPrice]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(points.length - 1);
    const bottomY = height - padding;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points.length]);

  return (
    <div
      className={`rounded-xl border border-border/80 bg-card/90 backdrop-blur-md p-4 space-y-3 transition-all ${themeClass}`}
    >
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">{itemName} 실시간 호가/입찰 틱</span>
          </div>
          <div className="text-sm font-bold font-mono tabular-nums text-foreground">
            {currentBid.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">WLD</span>
          </div>
        </div>

        <div className="inline-flex rounded-lg bg-muted/60 p-0.5 text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('ticks')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'ticks'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            입찰 틱 차트
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('depth')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'depth'
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            호가 Depth
          </button>
        </div>
      </div>

      {/* Tab 1: Real-time SVG Ticks Line Chart */}
      {activeTab === 'ticks' && (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-32 overflow-visible select-none"
          >
            <defs>
              <linearGradient id="auctionTickGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid baseline */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeDasharray="3 3"
            />
            <line
              x1={padding}
              y1={padding}
              x2={width - padding}
              y2={padding}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeDasharray="3 3"
            />

            {/* Area & Line */}
            {areaD && <path d={areaD} fill="url(#auctionTickGrad)" />}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points Markers */}
            {points.map((p, idx) => {
              const cx = getX(idx);
              const cy = getY(p.price);
              const isLatest = idx === points.length - 1;

              return (
                <g key={p.id} className="cursor-pointer">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isLatest ? 5 : p.isProxy ? 4 : 3}
                    fill={isLatest ? '#10b981' : p.isProxy ? '#38bdf8' : '#f59e0b'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-transform hover:scale-125"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {isLatest && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="9"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1"
                      className="animate-ping"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-1 right-2 bg-popover/95 border border-border shadow-lg rounded-md px-2.5 py-1 text-[11px] font-mono tabular-nums z-10 animate-in fade-in">
              <span className="font-semibold text-foreground">
                {hoveredPoint.bidderName}
              </span>
              {hoveredPoint.isPlusUser && (
                <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                  VIP
                </span>
              )}
              {hoveredPoint.isProxy && (
                <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold">
                  PROXY
                </span>
              )}
              : <span className="text-emerald-400 font-bold">{hoveredPoint.price.toLocaleString()} WLD</span>
              <span className="text-muted-foreground ml-1.5">({hoveredPoint.timestamp})</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Interactive Order Depth Stairway */}
      {activeTab === 'depth' && (
        <div className="space-y-1.5 py-1">
          <div className="text-[11px] font-semibold text-muted-foreground grid grid-cols-3 px-1 pb-1 border-b border-border/40">
            <span>호가 구간</span>
            <span className="text-center">입찰자 수</span>
            <span className="text-right">누적 매수 풀</span>
          </div>
          {depthTiers.map((tier, idx) => (
            <div
              key={`depth-${idx}`}
              className="relative overflow-hidden rounded-md px-2 py-1 flex items-center justify-between text-xs font-mono tabular-nums hover:bg-muted/40 transition-colors"
            >
              {/* Depth background fill bar */}
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500/10 pointer-events-none transition-all duration-300"
                style={{ width: `${Math.min(100, (tier.cumulativeVolume / 15) * 100)}%` }}
              />
              <span className="font-semibold text-emerald-400 z-10">
                {tier.price.toLocaleString()} WLD
              </span>
              <span className="text-muted-foreground z-10 text-center">
                {tier.bidCount}명 대기
              </span>
              <span className="font-bold text-foreground z-10 text-right">
                {tier.cumulativeVolume} Lot
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Bid Preset Increments */}
      {onQuickBid && (
        <div className="pt-2 border-t border-border/50 space-y-1.5">
          <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>⚡ 1-Click 호가 빠른 증액</span>
            <span className="text-[10px] text-zinc-400">클릭 즉시 입찰가 반영</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1000, 5000, 10000, 50000].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => onQuickBid(currentBid + inc)}
                className="py-1 px-1.5 rounded-lg bg-muted/70 hover:bg-emerald-500/20 hover:text-emerald-400 border border-border/60 hover:border-emerald-500/40 text-[11px] font-mono tabular-nums font-semibold transition-all active:scale-[0.97]"
              >
                +{inc >= 10000 ? `${inc / 10000}만` : `${inc.toLocaleString()}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footnote Stats */}
      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-muted-foreground pt-1 border-t border-border/40">
        <span>시작가: {startPrice.toLocaleString()} WLD</span>
        {buyNowPrice && <span>즉시낙찰가: {buyNowPrice.toLocaleString()} WLD</span>}
      </div>
    </div>
  );
}
