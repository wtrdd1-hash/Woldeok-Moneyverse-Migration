'use client';

import React from 'react';
import Link from 'next/link';
import { PieChart, ArrowUpRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';

export interface MicroHoldingItem {
  readonly symbol: string;
  readonly name: string;
  readonly quantity: number;
  readonly currentPrice: number;
  readonly marketValue: number;
  readonly gainLossRateBps?: number;
}

interface StockMicroPortfolioProps {
  readonly currentSymbol: string;
  readonly currentPrice: string;
  readonly holdingQuantity?: string | undefined;
  readonly otherHoldings?: readonly MicroHoldingItem[] | undefined;
  readonly isEn?: boolean | undefined;
}

const PALETTE = [
  '#10b981', // emerald
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#8b5cf6', // purple
];

export function StockMicroPortfolio({
  currentSymbol,
  currentPrice,
  holdingQuantity,
  otherHoldings = [],
  isEn = false,
}: StockMicroPortfolioProps) {
  const currentPriceNum = Number.parseInt(currentPrice.replaceAll(',', '') || '0', 10);
  const myQtyNum = Number.parseInt(holdingQuantity?.replaceAll(',', '') || '0', 10);
  const currentStockValue = Math.max(0, currentPriceNum * myQtyNum);

  // 현재 종목 항목
  const currentItem: MicroHoldingItem = {
    symbol: currentSymbol,
    name: currentSymbol,
    quantity: myQtyNum,
    currentPrice: currentPriceNum,
    marketValue: currentStockValue,
  };

  // 전체 보유 목록 (현재 종목 중복 방지 후 합산)
  const combinedHoldings: MicroHoldingItem[] = [
    currentItem,
    ...otherHoldings.filter((h) => h.symbol !== currentSymbol),
  ].filter((h) => h.marketValue > 0);

  const totalPortfolioValue = combinedHoldings.reduce((sum, h) => sum + h.marketValue, 0);

  // 현재 종목의 포트폴리오 점유 비중 (%)
  const currentStockSharePct = totalPortfolioValue > 0
    ? (currentStockValue / totalPortfolioValue) * 100
    : 0;

  // 도넛 차트 지오메트리 (SVG)
  const size = 96;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * radius;

  // 세그먼트 각도 계산
  let accumulatedPercent = 0;
  const segments = combinedHoldings.map((h, idx) => {
    const percent = totalPortfolioValue > 0 ? h.marketValue / totalPortfolioValue : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return {
      symbol: h.symbol,
      percent,
      strokeDasharray,
      strokeDashoffset,
      color: PALETTE[idx % PALETTE.length] ?? '#10b981',
    };
  });

  return (
    <Card className="border-border/80 bg-card/60 shadow-xs">
      <CardHeader className="p-3.5 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-foreground">
            <PieChart className="size-3.5 text-primary" />
            <span>{isEn ? 'Asset Allocation & Portfolio' : '포트폴리오 자산 비중'}</span>
          </CardTitle>
          <Link
            href="/stocks/portfolio"
            className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium"
          >
            <span>{isEn ? 'View All' : '전체 보기'}</span>
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 pt-1 space-y-3">
        {totalPortfolioValue <= 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-3 text-center space-y-1 bg-muted/10">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Wallet className="size-3.5" />
              <span>{isEn ? 'No stocks held yet' : '보유 중인 주식이 없습니다'}</span>
            </div>
            <p className="text-[11px] text-muted-foreground/80">
              {isEn
                ? 'Buy shares to automatically start tracking portfolio weights.'
                : '주문을 체결하면 포트폴리오 비중이 실시간으로 집계됩니다.'}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* 미니 SVG 도넛 차트 */}
            <div className="relative size-24 shrink-0 flex items-center justify-center">
              <svg
                className="size-full -rotate-90 transform"
                viewBox={`0 0 ${size} ${size}`}
                aria-label="Portfolio allocation micro donut chart"
              >
                {/* 배경 트랙 */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-muted/30"
                />
                {/* 세그먼트 아크들 */}
                {segments.map((seg) => (
                  <circle
                    key={seg.symbol}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                ))}
              </svg>

              {/* 도넛 중앙 현재 종목 비중 텍스트 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground font-mono">{currentSymbol}</span>
                <span className="text-xs font-mono font-extrabold text-foreground">
                  {currentStockSharePct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* 우측 수치 요약 */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate">{currentSymbol} 보유 평가액</span>
                <span className="font-mono font-bold text-foreground shrink-0">
                  {groupDigits(currentStockValue.toString())} WLD
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate">전체 주식 평가액</span>
                <span className="font-mono font-bold text-primary shrink-0">
                  {groupDigits(totalPortfolioValue.toString())} WLD
                </span>
              </div>

              {/* 상위 보유 종목 뱃지 스트립 */}
              <div className="flex flex-wrap gap-1 pt-1">
                {combinedHoldings.slice(0, 3).map((h, idx) => {
                  const pct = totalPortfolioValue > 0 ? (h.marketValue / totalPortfolioValue) * 100 : 0;
                  const color = PALETTE[idx % PALETTE.length];
                  return (
                    <Badge
                      key={h.symbol}
                      variant="outline"
                      className="text-[10px] font-mono px-1.5 py-0 border-border/80 flex items-center gap-1"
                    >
                      <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-semibold">{h.symbol}</span>
                      <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
