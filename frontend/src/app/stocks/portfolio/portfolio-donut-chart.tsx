'use client';

import React from 'react';
import { groupDigits } from '@/lib/money';
import type { PortfolioHoldingAnalysis } from './analysis';

interface PortfolioDonutChartProps {
  readonly holdings: readonly PortfolioHoldingAnalysis[];
  readonly totalMarketValue: string;
  readonly totalGainLossBps: string;
  readonly isEn?: boolean;
}

export function PortfolioDonutChart({
  holdings,
  totalMarketValue,
  totalGainLossBps,
  isEn = false,
}: PortfolioDonutChartProps) {
  const size = 200;
  const strokeWidth = 26;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const totalValueNum = Number(totalMarketValue) || 1;
  const isProfit = Number(totalGainLossBps) > 0;
  const isLoss = Number(totalGainLossBps) < 0;

  // 세그먼트 오프셋 누적 계산
  let accumulatedPercent = 0;
  const segments = holdings.map((holding) => {
    const value = Number(holding.market_value) || 0;
    const percent = totalValueNum > 0 ? (value / totalValueNum) : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      holding,
      percent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-2 sm:p-4">
      {/* SVG 도넛 원형 차트 */}
      <div className="relative size-48 sm:size-52 shrink-0 flex items-center justify-center">
        <svg
          className="size-full -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
          aria-label={isEn ? 'Portfolio asset allocation chart' : '포트폴리오 자산 배분 도넛 차트'}
        >
          {/* 배경 트랙 원 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          {/* 종목별 세그먼트 호 */}
          {segments.map(({ holding, strokeDasharray, strokeDashoffset }) => (
            <circle
              key={`segment-${holding.stock_id}`}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={holding.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              className="transition-all duration-700 hover:opacity-80"
            />
          ))}
        </svg>

        {/* 도넛 중앙 요약 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none select-none">
          <span className="text-[11px] font-medium text-muted-foreground">
            {isEn ? 'Total Valuation' : '총 평가액'}
          </span>
          <span className="font-mono text-sm sm:text-base font-extrabold text-foreground truncate max-w-[120px]">
            {groupDigits(totalMarketValue)}
          </span>
          <span className={`font-mono text-[11px] font-bold ${
            isProfit ? 'text-emerald-600 dark:text-emerald-400' : isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
          }`}>
            {isProfit ? '+' : ''}{(Number(totalGainLossBps) / 100).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 우측 종목별 비중 & 수량 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-xs font-mono">
        {holdings.slice(0, 8).map((holding) => {
          const allocationPct = (Number(holding.allocation_bps) / 100).toFixed(1);
          return (
            <div
              key={`donut-legend-${holding.stock_id}`}
              className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-muted/20 min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: holding.color }} />
                <span className="font-bold text-foreground truncate">{holding.symbol}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-semibold text-foreground">{allocationPct}%</span>
                <span className="text-[10px] text-muted-foreground ml-1">({groupDigits(holding.quantity)}주)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
