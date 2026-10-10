'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';

interface StockInteractiveChartProps {
  readonly currentPrice: string;
  readonly dayOpenPrice?: string | undefined;
  readonly dayHighPrice?: string | undefined;
  readonly dayLowPrice?: string | undefined;
  readonly symbol: string;
  readonly isEn?: boolean | undefined;
}

type Timeframe = '1D' | '1W' | '1M' | '1Y';

export function StockInteractiveChart({
  currentPrice,
  dayOpenPrice,
  dayHighPrice,
  dayLowPrice,
  symbol,
  isEn = false,
}: StockInteractiveChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; label: string } | null>(null);

  const priceNum = Number.parseInt(currentPrice.replaceAll(',', '') || '1000', 10);
  const openNum = Number.parseInt((dayOpenPrice ?? currentPrice).replaceAll(',', '') || '1000', 10);
  const diff = priceNum - openNum;
  const isUp = diff >= 0;
  const changeRate = openNum > 0 ? ((diff / openNum) * 100).toFixed(2) : '0.00';

  // 종목 심볼 및 타임프레임 기반 결정론적 난수 생성기 (패턴성 원천 배제)
  const chartPoints = useMemo(() => {
    const count = timeframe === '1D' ? 24 : timeframe === '1W' ? 28 : timeframe === '1M' ? 30 : 36;
    const base = openNum;
    const target = priceNum;
    const points: { price: number; label: string }[] = [];

    // 종목 심볼과 타임프레임으로 고유 시드 생성 (종목별 완전히 다른 궤적)
    let seed = 2166136261 >>> 0;
    const seedInput = `${symbol}:${timeframe}:${base}:${target}`;
    for (let c = 0; c < seedInput.length; c++) {
      seed = Math.imul(seed ^ seedInput.charCodeAt(c), 16777619);
    }
    const rng = () => {
      seed += 0x6d2b79f5;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    // Brownian Bridge: base에서 시작하여 target으로 수렴하는 비패턴적 랜덤워크
    const diffSpread = Math.max(base * 0.035, Math.abs(target - base) * 0.4);
    let currentWalk = 0;
    const rawWalks: number[] = [0];

    for (let i = 1; i < count - 1; i++) {
      // 정규분포 근사 노이즈 (-1.0 ~ +1.0)
      const shock = (rng() + rng() + rng() - 1.5) * 0.8;
      currentWalk += shock * diffSpread * 0.4;
      rawWalks.push(currentWalk);
    }
    rawWalks.push(0);

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      // 선형 기준선 + 브라운 브리지 편차 (끝점에서 정확히 0으로 수렴)
      const bridgeAdjustment = (rawWalks[i] ?? 0) * (4 * progress * (1 - progress));
      const interpolated = base + (target - base) * progress + bridgeAdjustment;
      const finalPrice = Math.max(1, Math.round(i === count - 1 ? target : interpolated));

      let label = '';
      if (timeframe === '1D') {
        const hour = 9 + Math.floor((i / count) * 6.5);
        const minute = (i % 4) * 15;
        label = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      } else if (timeframe === '1W') {
        label = `${i + 1}일 전`;
      } else if (timeframe === '1M') {
        label = `${Math.floor(i * 1.2) + 1}일`;
      } else {
        label = `${Math.floor(i / 3) + 1}월`;
      }

      points.push({ price: finalPrice, label });
    }
    return points;
  }, [timeframe, openNum, priceNum, symbol]);

  // SVG 좌표 계산
  const minVal = Math.min(...chartPoints.map((p) => p.price)) * 0.99;
  const maxVal = Math.max(...chartPoints.map((p) => p.price)) * 1.01;
  const range = maxVal - minVal || 1;

  const width = 600;
  const height = 220;
  const padding = 20;

  const svgPoints = useMemo(() => {
    return chartPoints.map((pt, idx) => {
      const x = padding + (idx / (chartPoints.length - 1)) * (width - padding * 2);
      const y = height - padding - ((pt.price - minVal) / range) * (height - padding * 2);
      return { x, y, price: pt.price, label: pt.label };
    });
  }, [chartPoints, minVal, range, width, height, padding]);

  const pathD = useMemo(() => {
    if (svgPoints.length === 0) return '';
    return svgPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  }, [svgPoints]);

  const areaD = useMemo(() => {
    if (svgPoints.length === 0) return '';
    const first = svgPoints[0]!;
    const last = svgPoints[svgPoints.length - 1]!;
    return `${pathD} L ${last.x},${height} L ${first.x},${height} Z`;
  }, [pathD, svgPoints, height]);

  const strokeColor = isUp ? '#10b981' : '#f43f5e';
  const fillColor = isUp ? 'url(#stock-emerald-gradient)' : 'url(#stock-rose-gradient)';

  return (
    <Card className="border-border/80 bg-card/60 shadow-md overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-muted-foreground">{symbol}</span>
              <Badge
                variant={isUp ? 'default' : 'destructive'}
                className="font-mono text-xs font-bold flex items-center gap-1"
              >
                {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                <span>{isUp ? '+' : ''}{changeRate}%</span>
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                {groupDigits((hoveredPoint ? hoveredPoint.price : priceNum).toString())}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">WLD</span>
              {hoveredPoint && (
                <span className="text-xs font-mono text-primary animate-in fade-in">
                  ({hoveredPoint.label})
                </span>
              )}
            </div>
          </div>

          {/* 타임프레임 탭 버튼 (1D, 1W, 1M, 1Y) */}
          <div className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1 self-start sm:self-auto shadow-inner" role="group" aria-label={isEn ? 'Chart Timeframe' : '차트 조회 기간'}>
            {(['1D', '1W', '1M', '1Y'] as const).map((tf) => {
              const labelMap: Record<string, string> = {
                '1D': isEn ? '1 Day' : '1일',
                '1W': isEn ? '1 Week' : '1주',
                '1M': isEn ? '1 Month' : '1개월',
                '1Y': isEn ? '1 Year' : '1년',
              };
              const isSelected = timeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  aria-pressed={isSelected}
                  aria-label={`${labelMap[tf]} ${isEn ? 'chart' : '차트 보기'}`}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-4 pt-0">
        {/* SVG 인터랙티브 캔버스 */}
        <div className="relative w-full h-[180px] sm:h-[220px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="stock-emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="stock-rose-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 그리드 가이드라인 */}
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" strokeDasharray="3 3" opacity="0.1" />
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" strokeDasharray="3 3" opacity="0.1" />

            {/* 영역 및 라인 패스 */}
            <path d={areaD} fill={fillColor} />
            <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* 인터랙티브 호버 감지 포인트 */}
            {svgPoints.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="6"
                className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                fill={strokeColor}
                onMouseEnter={() => setHoveredPoint(pt)}
              />
            ))}

            {/* 활성 툴팁 핀 */}
            {hoveredPoint && (
              <g pointerEvents="none">
                <line
                  x1={hoveredPoint.x}
                  y1={padding}
                  x2={hoveredPoint.x}
                  y2={height - padding}
                  stroke="currentColor"
                  strokeDasharray="2 2"
                  opacity="0.3"
                />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" fill={strokeColor} stroke="#fff" strokeWidth="2" />
              </g>
            )}
          </svg>
        </div>

        {/* 차트 하단 가격 요약 레인지 */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>{isEn ? 'Session Open' : '기준 시가'}: {groupDigits(openNum.toString())} WLD</span>
          </span>
          {dayHighPrice && dayLowPrice && (
            <span>
              {isEn ? 'Range' : '당일 고저'}: {groupDigits(dayLowPrice)} ~ {groupDigits(dayHighPrice)} WLD
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
