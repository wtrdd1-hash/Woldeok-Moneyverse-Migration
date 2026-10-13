'use client';

import React from 'react';
import {
  type ChartDrawingItem,
  FIBONACCI_LEVELS,
} from './stock-chart-drawing.types';
import { groupDigits } from '@/lib/money';

interface StockChartDrawingOverlayProps {
  readonly drawings: readonly ChartDrawingItem[];
  readonly activeDrawing: ChartDrawingItem | null;
  readonly width: number;
  readonly height: number;
  readonly minPrice: number;
  readonly maxPrice: number;
  readonly chartHeight: number;
  readonly paddingTop: number;
  readonly onDeleteItem?: (id: string) => void;
}

export function StockChartDrawingOverlay({
  drawings,
  activeDrawing,
  width,
  height,
  minPrice,
  maxPrice,
  chartHeight,
  paddingTop,
  onDeleteItem,
}: StockChartDrawingOverlayProps) {
  // y 좌표를 가격으로 변환하는 역함수
  const yToPrice = (y: number): number => {
    const ratio = (y - paddingTop) / chartHeight;
    const price = maxPrice - ratio * (maxPrice - minPrice);
    return Math.max(0, Math.round(price));
  };

  const allItems = activeDrawing ? [...drawings, activeDrawing] : drawings;

  return (
    <g className="pointer-events-none select-none">
      {allItems.map((item) => {
        const isPreview = item.id === activeDrawing?.id;

        // 1. 추세선 (Trendline)
        if (item.type === 'trendline') {
          const x2 = item.x2 ?? item.x1;
          const y2 = item.y2 ?? item.y1;
          const strokeColor = item.color || '#38bdf8';

          return (
            <g key={item.id} className="transition-opacity">
              <line
                x1={item.x1}
                y1={item.y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={isPreview ? 2 : 2.5}
                strokeDasharray={isPreview ? '4 3' : undefined}
                strokeLinecap="round"
                className="drop-shadow-xs"
              />
              {/* 시작 및 끝 앵커 원 */}
              <circle cx={item.x1} cy={item.y1} r={3} fill={strokeColor} stroke="#0f172a" strokeWidth={1} />
              <circle cx={x2} cy={y2} r={3} fill={strokeColor} stroke="#0f172a" strokeWidth={1} />

              {/* 완료된 선인 경우 중앙 각도/기울기 안내 라벨 */}
              {!isPreview && (
                <text
                  x={(item.x1 + x2) / 2}
                  y={(item.y1 + y2) / 2 - 6}
                  fontSize="9"
                  fontFamily="monospace"
                  fill={strokeColor}
                  textAnchor="middle"
                  className="font-bold opacity-80"
                >
                  Trend
                </text>
              )}
            </g>
          );
        }

        // 2. 수평 지지/저항선 (Horizontal Line)
        if (item.type === 'horizontal') {
          const strokeColor = item.color || '#10b981';
          const price = item.price1 || yToPrice(item.y1);

          return (
            <g key={item.id}>
              <line
                x1={0}
                y1={item.y1}
                x2={width}
                y2={item.y1}
                stroke={strokeColor}
                strokeWidth={isPreview ? 1.5 : 2}
                strokeDasharray={isPreview ? '4 3' : '5 3'}
                strokeLinecap="round"
                opacity={0.85}
              />
              {/* 우측 가격 라벨 뱃지 */}
              <rect
                x={width - 64}
                y={item.y1 - 8}
                width={62}
                height={16}
                rx={3}
                fill={strokeColor}
                opacity={0.9}
              />
              <text
                x={width - 33}
                y={item.y1 + 4}
                fontSize="9"
                fontFamily="monospace"
                fill="#ffffff"
                textAnchor="middle"
                className="font-bold tabular-nums"
              >
                {groupDigits(price.toString())}
              </text>
            </g>
          );
        }

        // 3. 피보나치 5단계 되돌림 (Fibonacci Retracement)
        if (item.type === 'fibonacci') {
          const y1 = item.y1;
          const y2 = item.y2 ?? item.y1;
          const topY = Math.min(y1, y2);
          const bottomY = Math.max(y1, y2);
          const heightDiff = bottomY - topY;

          return (
            <g key={item.id}>
              {/* 피보나치 레벨별 영역 배경 */}
              {!isPreview && heightDiff > 10 && (
                <rect
                  x={0}
                  y={topY}
                  width={width}
                  height={heightDiff}
                  fill="#38bdf8"
                  opacity={0.04}
                />
              )}

              {/* 5대 레벨 라인 렌더링 */}
              {FIBONACCI_LEVELS.map((level) => {
                // ratio 1.0이 top, 0.0이 bottom
                const currentY = y1 < y2
                  ? topY + (1.0 - level.ratio) * heightDiff
                  : bottomY - (1.0 - level.ratio) * heightDiff;
                const price = yToPrice(currentY);

                return (
                  <g key={`${item.id}_${level.ratio}`}>
                    <line
                      x1={0}
                      y1={currentY}
                      x2={width}
                      y2={currentY}
                      stroke={level.color}
                      strokeWidth={level.ratio === 0.618 || level.ratio === 0.5 ? 1.8 : 1.2}
                      strokeDasharray={isPreview ? '3 3' : '4 2'}
                      opacity={0.8}
                    />
                    {/* 좌측 비율 라벨 */}
                    <text
                      x={6}
                      y={currentY - 3}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fill={level.color}
                      className="font-bold opacity-90"
                    >
                      {level.label}
                    </text>
                    {/* 우측 가격 라벨 */}
                    <text
                      x={width - 6}
                      y={currentY - 3}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fill={level.color}
                      textAnchor="end"
                      className="font-bold opacity-90 tabular-nums"
                    >
                      {groupDigits(price.toString())}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        }

        return null;
      })}
    </g>
  );
}
