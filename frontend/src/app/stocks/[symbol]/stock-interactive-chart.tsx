'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, BarChart2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
type ChartType = 'line' | 'candle';

export interface CandlePoint {
  readonly index: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
  readonly label: string;
  readonly isUp: boolean;
  readonly ma5?: number | undefined;
  readonly ma20?: number | undefined;
}

export function StockInteractiveChart({
  currentPrice,
  dayOpenPrice,
  dayHighPrice,
  dayLowPrice,
  symbol,
  isEn = false,
}: StockInteractiveChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const priceNum = Number.parseInt(currentPrice.replaceAll(',', '') || '1000', 10);
  const openNum = Number.parseInt((dayOpenPrice ?? currentPrice).replaceAll(',', '') || '1000', 10);
  const diff = priceNum - openNum;
  const isUp = diff >= 0;
  const changeRate = openNum > 0 ? ((diff / openNum) * 100).toFixed(2) : '0.00';

  // 1. 종목 심볼과 타임프레임 기반 OHLC + Volume 데이터 시계열 생성 (결정론적 브라운 브리지)
  const candleSeries = useMemo<CandlePoint[]>(() => {
    const count = timeframe === '1D' ? 24 : timeframe === '1W' ? 28 : timeframe === '1M' ? 30 : 36;
    const base = openNum;
    const target = priceNum;
    const diffSpread = Math.max(base * 0.04, Math.abs(target - base) * 0.45);

    // 결정론적 시드 PRNG
    let seed = 2166136261 >>> 0;
    const seedInput = `${symbol}:${timeframe}:${base}:${target}:v2`;
    for (let c = 0; c < seedInput.length; c++) {
      seed = Math.imul(seed ^ seedInput.charCodeAt(c), 16777619);
    }
    const rng = () => {
      seed += 0x6d2b79f5;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    // 브라운 브리지 난수 궤적
    let currentWalk = 0;
    const rawWalks: number[] = [0];
    for (let i = 1; i < count - 1; i++) {
      const shock = (rng() + rng() + rng() - 1.5) * 0.8;
      currentWalk += shock * diffSpread * 0.4;
      rawWalks.push(currentWalk);
    }
    rawWalks.push(0);

    const closes: number[] = [];
    const points: CandlePoint[] = [];

    let prevClose = base;
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const bridgeAdjustment = (rawWalks[i] ?? 0) * (4 * progress * (1 - progress));
      const interpolated = base + (target - base) * progress + bridgeAdjustment;
      const finalClose = Math.max(1, Math.round(i === count - 1 ? target : interpolated));
      closes.push(finalClose);

      const open = i === 0 ? base : prevClose;
      const noiseHigh = Math.floor(rng() * (diffSpread * 0.35));
      const noiseLow = Math.floor(rng() * (diffSpread * 0.35));
      const high = Math.max(open, finalClose) + noiseHigh;
      const low = Math.max(1, Math.min(open, finalClose) - noiseLow);
      const isCandleUp = finalClose >= open;

      // 거래량(Volume) 모델링: 주가 변동폭에 비례한 유동성
      const volBase = Math.floor(500 + rng() * 1200);
      const volImpact = Math.floor((Math.abs(finalClose - open) / (base || 1)) * 10000);
      const volume = Math.max(120, volBase + volImpact);

      let label = '';
      if (timeframe === '1D') {
        const hour = 9 + Math.floor((i / count) * 6.5);
        const minute = (i % 4) * 15;
        label = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      } else if (timeframe === '1W') {
        label = `${count - i}일 전`;
      } else if (timeframe === '1M') {
        label = `${Math.floor(i * 1.1) + 1}일`;
      } else {
        label = `${Math.floor(i / 3) + 1}월`;
      }

      points.push({
        index: i,
        open,
        high,
        low,
        close: finalClose,
        volume,
        label,
        isUp: isCandleUp,
      });

      prevClose = finalClose;
    }

    // 이동평균선(MA5, MA20) 산출
    return points.map((pt, i) => {
      // MA 5
      let ma5: number | undefined;
      if (i >= 4) {
        const slice5 = closes.slice(i - 4, i + 1);
        ma5 = Math.round(slice5.reduce((a, b) => a + b, 0) / 5);
      }
      // MA 20
      let ma20: number | undefined;
      if (i >= 19) {
        const slice20 = closes.slice(i - 19, i + 1);
        ma20 = Math.round(slice20.reduce((a, b) => a + b, 0) / 20);
      }
      return { ...pt, ma5, ma20 };
    });
  }, [timeframe, openNum, priceNum, symbol]);

  // 2. SVG 렌더링 좌표계 계산
  const width = 640;
  const height = 240;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 48; // 하단 거래량 공간 확보
  const chartHeight = height - paddingTop - paddingBottom;
  const volumeHeight = 36;
  const volumeYBase = height - 12;

  const minPrice = useMemo(() => {
    return Math.min(...candleSeries.map((p) => p.low)) * 0.995;
  }, [candleSeries]);

  const maxPrice = useMemo(() => {
    return Math.max(...candleSeries.map((p) => p.high)) * 1.005;
  }, [candleSeries]);

  const priceRange = maxPrice - minPrice || 1;
  const maxVolume = useMemo(() => {
    return Math.max(...candleSeries.map((p) => p.volume), 1);
  }, [candleSeries]);

  const getYForPrice = (p: number) => {
    return paddingTop + chartHeight - ((p - minPrice) / priceRange) * chartHeight;
  };

  const candleWidth = useMemo(() => {
    const slotWidth = (width - paddingX * 2) / candleSeries.length;
    return Math.max(3, Math.min(14, slotWidth * 0.65));
  }, [candleSeries.length]);

  const svgCandles = useMemo(() => {
    return candleSeries.map((c) => {
      const x = paddingX + (c.index / (candleSeries.length - 1)) * (width - paddingX * 2);
      const yOpen = getYForPrice(c.open);
      const yClose = getYForPrice(c.close);
      const yHigh = getYForPrice(c.high);
      const yLow = getYForPrice(c.low);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
      const volH = (c.volume / maxVolume) * volumeHeight;
      const volY = volumeYBase - volH;

      const yMa5 = c.ma5 ? getYForPrice(c.ma5) : undefined;
      const yMa20 = c.ma20 ? getYForPrice(c.ma20) : undefined;

      return {
        ...c,
        x,
        yOpen,
        yClose,
        yHigh,
        yLow,
        bodyTop,
        bodyHeight,
        volH,
        volY,
        yMa5,
        yMa20,
      };
    });
  }, [candleSeries, minPrice, priceRange, maxVolume]);

  // 라인 차트용 패스
  const linePathD = useMemo(() => {
    return svgCandles.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.yClose}` : `${acc} L ${pt.x},${pt.yClose}`;
    }, '');
  }, [svgCandles]);

  const lineAreaD = useMemo(() => {
    if (svgCandles.length === 0) return '';
    const first = svgCandles[0]!;
    const last = svgCandles[svgCandles.length - 1]!;
    const baseLineY = paddingTop + chartHeight;
    return `${linePathD} L ${last.x},${baseLineY} L ${first.x},${baseLineY} Z`;
  }, [linePathD, svgCandles, chartHeight, paddingTop]);

  // MA5, MA20 SVG 라인 패스
  const ma5PathD = useMemo(() => {
    const pts = svgCandles.filter((c) => c.yMa5 !== undefined);
    return pts.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.yMa5}` : `${acc} L ${pt.x},${pt.yMa5}`;
    }, '');
  }, [svgCandles]);

  const ma20PathD = useMemo(() => {
    const pts = svgCandles.filter((c) => c.yMa20 !== undefined);
    return pts.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.yMa20}` : `${acc} L ${pt.x},${pt.yMa20}`;
    }, '');
  }, [svgCandles]);

  // 현재 활성 캔들 (호버 시 해당 캔들, 평소엔 최신 캔들)
  const activeCandle = hoveredIdx !== null && svgCandles[hoveredIdx] ? svgCandles[hoveredIdx] : svgCandles[svgCandles.length - 1];

  return (
    <Card className="border-border/80 bg-card/70 shadow-sm overflow-hidden select-none">
      <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* 심볼 및 가격 헤더 */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-muted-foreground">{symbol}</span>
              <Badge
                variant={isUp ? 'default' : 'destructive'}
                className="font-mono text-xs font-bold flex items-center gap-1 tabular-nums"
              >
                {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                <span>{isUp ? '+' : ''}{changeRate}%</span>
              </Badge>
              {/* 차트 모드 토글 (Candle / Line) */}
              <div className="inline-flex rounded-lg border border-border/70 bg-muted/50 p-0.5 text-[11px] font-semibold ml-1">
                <button
                  type="button"
                  onClick={() => setChartType('candle')}
                  className={`rounded px-2 py-0.5 transition-all flex items-center gap-1 ${
                    chartType === 'candle'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={isEn ? 'Candlestick Chart' : '캔들스틱 봉차트'}
                >
                  <BarChart2 className="size-3" />
                  <span>{isEn ? 'Candle' : '봉'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`rounded px-2 py-0.5 transition-all flex items-center gap-1 ${
                    chartType === 'line'
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={isEn ? 'Line Area Chart' : '라인 에어리어 차트'}
                >
                  <Activity className="size-3" />
                  <span>{isEn ? 'Line' : '선'}</span>
                </button>
              </div>
            </div>

            {/* 현재가 대형 표기 */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight text-foreground">
                {groupDigits((activeCandle ? activeCandle.close : priceNum).toString())}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">WLD</span>
              {activeCandle && (
                <span className="text-xs font-mono text-primary font-bold animate-in fade-in tabular-nums">
                  ({activeCandle.label})
                </span>
              )}
            </div>
          </div>

          {/* 타임프레임 선택 버튼 (1D, 1W, 1M, 1Y) */}
          <div
            className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1 self-start sm:self-auto shadow-inner"
            role="group"
            aria-label={isEn ? 'Chart Timeframe' : '차트 조회 기간'}
          >
            {(['1D', '1W', '1M', '1Y'] as const).map((tf) => {
              const isSelected = timeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  aria-pressed={isSelected}
                  className={`rounded-lg px-2.5 sm:px-3 py-1 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* TradingView 스타일 실시간 OHLC + MA 인디케이터 바 */}
        {activeCandle && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[11px] font-mono tabular-nums text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground/70">O</span>
              <span className="font-bold text-foreground">{groupDigits(activeCandle.open.toString())}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground/70">H</span>
              <span className="font-bold text-rose-500">{groupDigits(activeCandle.high.toString())}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground/70">L</span>
              <span className="font-bold text-emerald-500">{groupDigits(activeCandle.low.toString())}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground/70">C</span>
              <span className={`font-bold ${activeCandle.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {groupDigits(activeCandle.close.toString())}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-muted-foreground/70">Vol</span>
              <span className="font-semibold text-foreground">{groupDigits(activeCandle.volume.toString())}</span>
            </span>
            {activeCandle.ma5 && (
              <span className="flex items-center gap-1 text-amber-500 hidden sm:inline-flex">
                <span>MA5</span>
                <span className="font-bold">{groupDigits(activeCandle.ma5.toString())}</span>
              </span>
            )}
            {activeCandle.ma20 && (
              <span className="flex items-center gap-1 text-indigo-400 hidden sm:inline-flex">
                <span>MA20</span>
                <span className="font-bold">{groupDigits(activeCandle.ma20.toString())}</span>
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-2 sm:p-4 pt-1">
        {/* SVG 인터랙티브 차트 캔버스 */}
        <div className="relative w-full h-[200px] sm:h-[240px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible touch-none cursor-crosshair"
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              <linearGradient id="tv-chart-gradient-rise" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="tv-chart-gradient-fall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 수평 그리드 가이드라인 */}
            <line x1={paddingX} y1={paddingTop} x2={width - paddingX} y2={paddingTop} stroke="currentColor" strokeDasharray="3 3" opacity="0.08" />
            <line x1={paddingX} y1={paddingTop + chartHeight / 2} x2={width - paddingX} y2={paddingTop + chartHeight / 2} stroke="currentColor" strokeDasharray="3 3" opacity="0.08" />
            <line x1={paddingX} y1={paddingTop + chartHeight} x2={width - paddingX} y2={paddingTop + chartHeight} stroke="currentColor" strokeDasharray="3 3" opacity="0.12" />

            {/* 하단 거래량(Volume) 히스토그램 */}
            {svgCandles.map((c) => (
              <rect
                key={`vol-${c.index}`}
                x={c.x - candleWidth / 2}
                y={c.volY}
                width={candleWidth}
                height={Math.max(1, c.volH)}
                fill={c.isUp ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)'}
                rx={1}
                pointerEvents="none"
              />
            ))}

            {/* 모드 1: 캔들스틱 차트 */}
            {chartType === 'candle' && (
              <g pointerEvents="none">
                {svgCandles.map((c) => {
                  const candleColor = c.isUp ? '#10b981' : '#f43f5e';
                  return (
                    <g key={`candle-${c.index}`}>
                      {/* 고가-저가 꼬리선 (Wick) */}
                      <line
                        x1={c.x}
                        y1={c.yHigh}
                        x2={c.x}
                        y2={c.yLow}
                        stroke={candleColor}
                        strokeWidth="1.25"
                      />
                      {/* 시가-종가 몸통 (Body) */}
                      <rect
                        x={c.x - candleWidth / 2}
                        y={c.bodyTop}
                        width={candleWidth}
                        height={c.bodyHeight}
                        fill={candleColor}
                        rx={1}
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* 모드 2: 라인 에어리어 차트 */}
            {chartType === 'line' && (
              <g pointerEvents="none">
                <path
                  d={lineAreaD}
                  fill={isUp ? 'url(#tv-chart-gradient-rise)' : 'url(#tv-chart-gradient-fall)'}
                />
                <path
                  d={linePathD}
                  fill="none"
                  stroke={isUp ? '#10b981' : '#f43f5e'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* 보조지표: MA5 (골드 앰버) & MA20 (퍼플 인디고) */}
            {ma5PathD && (
              <path
                d={ma5PathD}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                opacity="0.85"
                pointerEvents="none"
              />
            )}
            {ma20PathD && (
              <path
                d={ma20PathD}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                opacity="0.8"
                pointerEvents="none"
              />
            )}

            {/* 인터랙티브 호버 감지 투명 박스 슬롯 */}
            {svgCandles.map((c, idx) => {
              const slotW = (width - paddingX * 2) / svgCandles.length;
              return (
                <rect
                  key={`slot-${c.index}`}
                  x={c.x - slotW / 2}
                  y={0}
                  width={slotW}
                  height={height}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onTouchStart={() => setHoveredIdx(idx)}
                />
              );
            })}

            {/* TradingView 스타일 SVG 십자선(Crosshair) 및 툴팁 핀 */}
            {hoveredIdx !== null && svgCandles[hoveredIdx] && (
              <g pointerEvents="none">
                {/* 세로선 */}
                <line
                  x1={svgCandles[hoveredIdx].x}
                  y1={paddingTop}
                  x2={svgCandles[hoveredIdx].x}
                  y2={height - 10}
                  stroke="currentColor"
                  strokeDasharray="2 2"
                  opacity="0.4"
                />
                {/* 가로선 (현재 종가 지점) */}
                <line
                  x1={paddingX}
                  y1={svgCandles[hoveredIdx].yClose}
                  x2={width - paddingX}
                  y2={svgCandles[hoveredIdx].yClose}
                  stroke="currentColor"
                  strokeDasharray="2 2"
                  opacity="0.4"
                />
                {/* 중심 핀 원형 */}
                <circle
                  cx={svgCandles[hoveredIdx].x}
                  cy={svgCandles[hoveredIdx].yClose}
                  r="4"
                  fill={svgCandles[hoveredIdx].isUp ? '#10b981' : '#f43f5e'}
                  stroke="#fff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* 차트 하단 가격 요약 및 범례 레인지 */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/60 text-[11px] font-mono tabular-nums text-muted-foreground gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              <span>{isEn ? 'Open' : '시가'}: {groupDigits(openNum.toString())} WLD</span>
            </span>
            {dayHighPrice && dayLowPrice && (
              <span className="hidden sm:inline">
                {isEn ? 'Range' : '당일고저'}: {groupDigits(dayLowPrice)} ~ {groupDigits(dayHighPrice)} WLD
              </span>
            )}
          </div>
          {/* 보조지표 범례 */}
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-amber-500 font-bold">MA5</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-indigo-400 font-bold">MA20</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-xs bg-muted-foreground/60 shrink-0" />
              <span>{isEn ? 'Vol' : '거래량'}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
