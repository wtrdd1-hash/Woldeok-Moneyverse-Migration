'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, BarChart2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import { playStockTickSound } from '@/lib/audio-effects';

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
  readonly bbUpper?: number | undefined;
  readonly bbLower?: number | undefined;
  readonly rsi?: number | undefined;
}

interface ChartIndicators {
  ma: boolean;
  bb: boolean;
  rsi: boolean;
}

const STORAGE_KEY = 'wdmv_stock_chart_prefs_v1';

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
  const [indicators, setIndicators] = useState<ChartIndicators>({
    ma: true,
    bb: true,
    rsi: true,
  });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // localStorage 환경설정 영구 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.chartType === 'line' || parsed.chartType === 'candle') {
          setChartType(parsed.chartType);
        }
        if (parsed.timeframe) {
          setTimeframe(parsed.timeframe);
        }
        if (parsed.indicators) {
          setIndicators(parsed.indicators);
        }
      }
    } catch {
      // Ignore localStorage access failures
    }
  }, []);

  const savePrefs = (
    nextType: ChartType,
    nextTf: Timeframe,
    nextInd: ChartIndicators
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          chartType: nextType,
          timeframe: nextTf,
          indicators: nextInd,
        })
      );
    } catch {
      // Ignore localStorage access failures
    }
  };

  const handleToggleIndicator = (key: keyof ChartIndicators) => {
    setIndicators((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      savePrefs(chartType, timeframe, updated);
      return updated;
    });
    playStockTickSound();
  };

  const handleSetChartType = (nextType: ChartType) => {
    setChartType(nextType);
    playStockTickSound();
    savePrefs(nextType, timeframe, indicators);
  };

  const handleSetTimeframe = (nextTf: Timeframe) => {
    setTimeframe(nextTf);
    playStockTickSound();
    savePrefs(chartType, nextTf, indicators);
  };

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

    // 종가 시계열 계산
    const closes: number[] = [];
    for (let i = 0; i < count; i++) {
      const bridge = rawWalks[i] ?? 0;
      const trend = base + ((target - base) * i) / (count - 1);
      const val = Math.max(1, Math.round(trend + bridge));
      closes.push(val);
    }
    if (closes.length > 0) {
      closes[closes.length - 1] = target;
    }

    // 캔들스틱 OHLC 및 Volume 생성
    const points: CandlePoint[] = [];
    let prevClose = base;

    for (let i = 0; i < count; i++) {
      const open = i === 0 ? base : prevClose;
      const finalClose = closes[i] ?? base;
      const isCandleUp = finalClose >= open;

      const noiseH = (rng() * 0.4 + 0.1) * diffSpread;
      const noiseL = (rng() * 0.4 + 0.1) * diffSpread;

      const high = Math.round(Math.max(open, finalClose) + noiseH);
      const low = Math.max(1, Math.round(Math.min(open, finalClose) - noiseL));

      const volFactor = 100 + Math.round(rng() * 400);
      const spreadAbs = Math.abs(finalClose - open) + 1;
      const volume = Math.round(volFactor * spreadAbs * (1 + rng() * 0.5));

      let label = '';
      if (timeframe === '1D') {
        const hour = (9 + Math.floor((i * 6.5) / count)).toString().padStart(2, '0');
        const min = Math.floor((i % 4) * 15).toString().padStart(2, '0');
        label = `${hour}:${min}`;
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

    // 이동평균선(MA5, MA20), 볼린저 밴드(20, 2), RSI(14) 산출
    return points.map((pt, i) => {
      // MA 5
      let ma5: number | undefined;
      if (i >= 4) {
        const slice5 = closes.slice(i - 4, i + 1);
        ma5 = Math.round(slice5.reduce((a, b) => a + b, 0) / 5);
      }
      // MA 20 & Bollinger Bands (20, 2)
      let ma20: number | undefined;
      let bbUpper: number | undefined;
      let bbLower: number | undefined;
      if (i >= 19) {
        const slice20 = closes.slice(i - 19, i + 1);
        const mean = slice20.reduce((a, b) => a + b, 0) / 20;
        ma20 = Math.round(mean);
        const variance = slice20.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        bbUpper = Math.round(mean + 2 * stdDev);
        bbLower = Math.max(1, Math.round(mean - 2 * stdDev));
      }
      // RSI 14 (Relative Strength Index)
      let rsi: number | undefined;
      if (i >= 14) {
        let gainSum = 0;
        let lossSum = 0;
        for (let j = i - 13; j <= i; j++) {
          const delta = (closes[j] ?? 0) - (closes[j - 1] ?? 0);
          if (delta > 0) gainSum += delta;
          else lossSum += Math.abs(delta);
        }
        const avgGain = gainSum / 14;
        const avgLoss = lossSum / 14;
        if (avgLoss === 0) {
          rsi = 100;
        } else {
          const rs = avgGain / avgLoss;
          rsi = Math.round(100 - (100 / (1 + rs)));
        }
      }
      return { ...pt, ma5, ma20, bbUpper, bbLower, rsi };
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
    let min = Math.min(...candleSeries.map((c) => c.low));
    candleSeries.forEach((c) => {
      if (c.bbLower && c.bbLower < min) min = c.bbLower;
    });
    return Math.floor(min * 0.995);
  }, [candleSeries]);

  const maxPrice = useMemo(() => {
    let max = Math.max(...candleSeries.map((c) => c.high));
    candleSeries.forEach((c) => {
      if (c.bbUpper && c.bbUpper > max) max = c.bbUpper;
    });
    return Math.ceil(max * 1.005);
  }, [candleSeries]);

  const priceRange = Math.max(1, maxPrice - minPrice);

  const maxVolume = useMemo(() => {
    return Math.max(1, ...candleSeries.map((c) => c.volume));
  }, [candleSeries]);

  const getY = (val: number) => {
    const ratio = (val - minPrice) / priceRange;
    return paddingTop + chartHeight * (1 - ratio);
  };

  const getVolY = (vol: number) => {
    const ratio = vol / maxVolume;
    const h = ratio * volumeHeight;
    return { y: volumeYBase - h, h };
  };

  // 캔들별 SVG 렌더링 파라미터 계산
  const svgCandles = useMemo(() => {
    const len = candleSeries.length;
    const stepX = (width - paddingX * 2) / Math.max(1, len - 1);

    return candleSeries.map((c, i) => {
      const x = paddingX + i * stepX;
      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
      const { y: volY, h: volH } = getVolY(c.volume);

      let yMa5: number | null = null;
      if (c.ma5 !== undefined) yMa5 = getY(c.ma5);

      let yMa20: number | null = null;
      if (c.ma20 !== undefined) yMa20 = getY(c.ma20);

      let yBbUpper: number | null = null;
      let yBbLower: number | null = null;
      if (c.bbUpper !== undefined) yBbUpper = getY(c.bbUpper);
      if (c.bbLower !== undefined) yBbLower = getY(c.bbLower);

      return {
        ...c,
        x,
        yOpen,
        yClose,
        yHigh,
        yLow,
        bodyTop,
        bodyHeight,
        volY,
        volH,
        yMa5,
        yMa20,
        yBbUpper,
        yBbLower,
      };
    });
  }, [candleSeries, minPrice, priceRange, maxVolume]);

  const candleWidth = Math.max(3, Math.min(14, (width - paddingX * 2) / candleSeries.length * 0.65));

  // 라인 에어리어 패스 생성
  const linePathD = useMemo(() => {
    if (svgCandles.length === 0) return '';
    return svgCandles
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.yClose.toFixed(1)}`)
      .join(' ');
  }, [svgCandles]);

  const lineAreaD = useMemo(() => {
    if (svgCandles.length === 0) return '';
    const first = svgCandles[0];
    const last = svgCandles[svgCandles.length - 1];
    if (!first || !last) return '';
    const bottomY = paddingTop + chartHeight;
    return `${linePathD} L ${last.x.toFixed(1)},${bottomY} L ${first.x.toFixed(1)},${bottomY} Z`;
  }, [linePathD, svgCandles, paddingTop, chartHeight]);

  // MA 5 패스
  const ma5PathD = useMemo(() => {
    const valid = svgCandles.filter((c) => c.yMa5 !== null);
    if (valid.length < 2) return '';
    return valid
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.yMa5!.toFixed(1)}`)
      .join(' ');
  }, [svgCandles]);

  // MA 20 패스
  const ma20PathD = useMemo(() => {
    const valid = svgCandles.filter((c) => c.yMa20 !== null);
    if (valid.length < 2) return '';
    return valid
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.yMa20!.toFixed(1)}`)
      .join(' ');
  }, [svgCandles]);

  // 볼린저 밴드 상단/하단 패스 및 밴드 영역
  const bbPaths = useMemo(() => {
    const valid = svgCandles.filter((c) => c.yBbUpper !== null && c.yBbLower !== null);
    if (valid.length < 2) return null;

    const upperD = valid
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.yBbUpper!.toFixed(1)}`)
      .join(' ');

    const lowerD = valid
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.yBbLower!.toFixed(1)}`)
      .join(' ');

    const reversedLower = [...valid].reverse()
      .map((c) => `L ${c.x.toFixed(1)},${c.yBbLower!.toFixed(1)}`)
      .join(' ');

    const bandAreaD = `${upperD} ${reversedLower} Z`;

    return { upperD, lowerD, bandAreaD };
  }, [svgCandles]);

  // RSI 14 서브패널 패스
  const rsiWidth = width;
  const rsiHeight = 44;
  const rsiPadTop = 6;
  const rsiPadBottom = 6;
  const rsiPlotH = rsiHeight - rsiPadTop - rsiPadBottom;

  const rsiPathD = useMemo(() => {
    const valid = svgCandles.filter((c) => c.rsi !== undefined);
    if (valid.length < 2) return '';
    return valid
      .map((c, i) => {
        const ratio = (c.rsi! / 100);
        const y = rsiPadTop + rsiPlotH * (1 - ratio);
        return `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [svgCandles, rsiPlotH]);

  const activeCandle = hoveredIdx !== null && svgCandles[hoveredIdx]
    ? svgCandles[hoveredIdx]
    : svgCandles[svgCandles.length - 1];

  return (
    <Card className="moneyverse-card border-border/80 bg-card/70 shadow-sm overflow-hidden select-none">
      <CardHeader className="p-3.5 sm:p-4 pb-2 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-muted-foreground">{symbol}</span>
              <Badge
                variant={isUp ? 'default' : 'destructive'}
                className="font-mono text-xs font-bold flex items-center gap-1 tabular-nums"
              >
                {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                <span>{isUp ? '+' : ''}{changeRate}%</span>
              </Badge>

              {/* 캔들스틱 / 라인 에어리어 듀얼 모드 토글 */}
              <div className="inline-flex rounded-lg border border-border/70 bg-muted/50 p-0.5 text-[11px] font-semibold ml-1">
                <button
                  type="button"
                  onClick={() => handleSetChartType('candle')}
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
                  onClick={() => handleSetChartType('line')}
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

              {/* 보조지표 On/Off 토글 칩 (MA, BB, RSI) */}
              <div className="inline-flex rounded-lg border border-border/70 bg-muted/50 p-0.5 text-[10px] font-bold gap-0.5 ml-1">
                <button
                  type="button"
                  onClick={() => handleToggleIndicator('ma')}
                  className={`rounded px-1.5 py-0.5 transition-all ${
                    indicators.ma
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  }`}
                  title="이동평균선 (MA5 / MA20) 토글"
                >
                  MA
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleIndicator('bb')}
                  className={`rounded px-1.5 py-0.5 transition-all ${
                    indicators.bb
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  }`}
                  title="볼린저 밴드 (20, 2) 토글"
                >
                  BB
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleIndicator('rsi')}
                  className={`rounded px-1.5 py-0.5 transition-all ${
                    indicators.rsi
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  }`}
                  title="상대강도지수 (RSI 14) 서브패널 토글"
                >
                  RSI
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
                  onClick={() => handleSetTimeframe(tf)}
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

        {/* TradingView 스타일 실시간 OHLC + 인디케이터 바 */}
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
            {indicators.ma && activeCandle.ma5 && (
              <span className="flex items-center gap-1 text-amber-500 hidden sm:inline-flex">
                <span>MA5</span>
                <span className="font-bold">{groupDigits(activeCandle.ma5.toString())}</span>
              </span>
            )}
            {indicators.ma && activeCandle.ma20 && (
              <span className="flex items-center gap-1 text-indigo-400 hidden sm:inline-flex">
                <span>MA20</span>
                <span className="font-bold">{groupDigits(activeCandle.ma20.toString())}</span>
              </span>
            )}
            {indicators.bb && activeCandle.bbUpper && activeCandle.bbLower && (
              <span className="flex items-center gap-1 text-indigo-300 hidden md:inline-flex">
                <span>BB</span>
                <span className="font-bold">{groupDigits(activeCandle.bbUpper.toString())}/{groupDigits(activeCandle.bbLower.toString())}</span>
              </span>
            )}
            {indicators.rsi && activeCandle.rsi !== undefined && (
              <span className={`flex items-center gap-1 hidden md:inline-flex ${
                activeCandle.rsi >= 70 ? 'text-rose-400 font-bold' : activeCandle.rsi <= 30 ? 'text-emerald-400 font-bold' : 'text-purple-400'
              }`}>
                <span>RSI(14)</span>
                <span className="font-bold">{activeCandle.rsi}</span>
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-2 sm:p-4 pt-1 space-y-2">
        {/* SVG 인터랙티브 메인 차트 캔버스 */}
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

            {/* 볼린저 밴드 음영 영역 및 경계선 */}
            {indicators.bb && bbPaths && (
              <g pointerEvents="none">
                <path
                  d={bbPaths.bandAreaD}
                  fill="rgba(99, 102, 241, 0.08)"
                />
                <path
                  d={bbPaths.upperD}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />
                <path
                  d={bbPaths.lowerD}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />
              </g>
            )}

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
            {indicators.ma && ma5PathD && (
              <path
                d={ma5PathD}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                opacity="0.85"
                pointerEvents="none"
              />
            )}
            {indicators.ma && ma20PathD && (
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

        {/* RSI 14 서브패널 (선택 시 하단에 독립 렌더링) */}
        {indicators.rsi && (
          <div className="pt-1 border-t border-border/40">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1 pb-1">
              <span className="flex items-center gap-1.5 font-bold text-purple-400">
                <span className="size-2 rounded-full bg-purple-500" />
                <span>RSI (14)</span>
                {activeCandle?.rsi !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                    activeCandle.rsi >= 70
                      ? 'bg-rose-500/20 text-rose-400 font-bold'
                      : activeCandle.rsi <= 30
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {activeCandle.rsi} ({activeCandle.rsi >= 70 ? '과매수' : activeCandle.rsi <= 30 ? '과매도' : '중립'})
                  </span>
                )}
              </span>
              <span className="opacity-70">Overbought 70 / Oversold 30</span>
            </div>
            <div className="relative w-full h-[44px]">
              <svg
                viewBox={`0 0 ${rsiWidth} ${rsiHeight}`}
                className="w-full h-full overflow-visible touch-none"
                preserveAspectRatio="none"
              >
                {/* 과매수 70선 */}
                <line
                  x1={paddingX}
                  y1={rsiPadTop + rsiPlotH * 0.3}
                  x2={rsiWidth - paddingX}
                  y2={rsiPadTop + rsiPlotH * 0.3}
                  stroke="#f59e0b"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                  opacity="0.5"
                />
                {/* 중심 50선 */}
                <line
                  x1={paddingX}
                  y1={rsiPadTop + rsiPlotH * 0.5}
                  x2={rsiWidth - paddingX}
                  y2={rsiPadTop + rsiPlotH * 0.5}
                  stroke="currentColor"
                  strokeDasharray="2 2"
                  strokeWidth="0.75"
                  opacity="0.2"
                />
                {/* 과매도 30선 */}
                <line
                  x1={paddingX}
                  y1={rsiPadTop + rsiPlotH * 0.7}
                  x2={rsiWidth - paddingX}
                  y2={rsiPadTop + rsiPlotH * 0.7}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                  opacity="0.5"
                />
                {/* RSI 곡선 */}
                {rsiPathD && (
                  <path
                    d={rsiPathD}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {/* 호버 포인트 핀 */}
                {hoveredIdx !== null && svgCandles[hoveredIdx]?.rsi !== undefined && (
                  <circle
                    cx={svgCandles[hoveredIdx].x}
                    cy={rsiPadTop + rsiPlotH * (1 - svgCandles[hoveredIdx].rsi! / 100)}
                    r="3"
                    fill="#a855f7"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                )}
              </svg>
            </div>
          </div>
        )}

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
            {indicators.ma && (
              <>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-amber-500 font-bold">MA5</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-indigo-400 font-bold">MA20</span>
                </span>
              </>
            )}
            {indicators.bb && (
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-indigo-400/50 shrink-0" />
                <span className="text-indigo-300 font-bold">BB(20,2)</span>
              </span>
            )}
            {indicators.rsi && (
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-purple-500 shrink-0" />
                <span className="text-purple-400 font-bold">RSI(14)</span>
              </span>
            )}
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
