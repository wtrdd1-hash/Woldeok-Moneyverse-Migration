'use client';

import React, { useEffect, useRef, useState } from 'react';
import { groupDigits } from '@/lib/money';

/**
 * Candles, drawn the way a Korean market draws them: a wick from the low to
 * the high, a body from open to close, and both directions filled — a red
 * body for a session that closed up, a blue one for a session that closed
 * down. Hollow-for-up is the Western convention and reads here as "this one
 * is missing something".
 *
 * Candles arrive oldest first, which is the order `stock_candles` returns and
 * the order a chart reads.
 *
 * Geometry from BigInt, like every other chart here — a price is a
 * `numeric(38,0)` and `Number()` rounds silently past 2^53, which on a chart
 * puts two different prices at the same height.
 */
export interface Candle {
  /** Start of the bucket. A date for daily and weekly, a timestamp below that. */
  readonly at: string;
  readonly open_price: string;
  readonly high_price: string;
  readonly low_price: string;
  readonly close_price: string;
}

const HEIGHT = 260;
const SLOT_MAX = 20;
const SLOT_MIN = 9;
const MIN_WIDTH = 260;
const ASSUMED_WIDTH = 720;
const PADDING_Y = 16;
const SCALE = 100_000n;
const INTEGER = /^-?\d+$/;
const LOG_SPREAD = 8n;

function log10(value: bigint): number {
  const digits = value.toString();
  if (digits.length <= 15) return Math.log10(Number(digits));
  return digits.length - 15 + Math.log10(Number(digits.slice(0, 15)));
}

function pow10(exponent: number): bigint {
  return 10n ** BigInt(exponent);
}

function niceStep(span: bigint, target: number): bigint {
  const rough = span / BigInt(target);
  if (rough < 1n) return 1n;
  const exponent = rough.toString().length - 1;
  const base = pow10(exponent);
  const candidates = [
    base,
    2n * base,
    ...(exponent >= 1 ? [25n * pow10(exponent - 1)] : []),
    5n * base,
    10n * base,
  ];
  return candidates.find((candidate) => candidate >= rough) ?? 10n * base;
}

export function axisTicks(min: bigint, max: bigint, logarithmic: boolean): bigint[] {
  if (max <= min) return [min];
  if (!logarithmic) {
    const step = niceStep(max - min, 4);
    const ticks: bigint[] = [];
    for (let value = ((min + step - 1n) / step) * step; value <= max; value += step) {
      ticks.push(value);
    }
    return ticks;
  }
  const ticks: bigint[] = [];
  const lowest = Math.max(0, min.toString().length - 1);
  const highest = max.toString().length - 1;
  for (let exponent = lowest; exponent <= highest; exponent += 1) {
    for (const mantissa of [1n, 2n, 5n]) {
      const value = mantissa * pow10(exponent);
      if (value >= min && value <= max) ticks.push(value);
    }
  }
  return ticks.length > 8 ? ticks.filter((value) => value.toString().startsWith('1')) : ticks;
}

export function CandleChart({
  candles,
  label,
}: {
  readonly candles: readonly Candle[];
  /** How to write a bucket's start under the axis. Raw, if not given. */
  readonly label?: (at: string) => string;
}) {
  const [showMA5, setShowMA5] = useState(true);
  const [showMA20, setShowMA20] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);

  const ordered = candles.filter(
    (candle) =>
      INTEGER.test(candle.open_price) &&
      INTEGER.test(candle.high_price) &&
      INTEGER.test(candle.low_price) &&
      INTEGER.test(candle.close_price),
  );
  const drawable = ordered.length > 0;

  const frame = useRef<HTMLDivElement | null>(null);
  const [frameWidth, setFrameWidth] = useState(0);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = (): void => setFrameWidth(element.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [drawable]);

  if (!drawable) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        아직 그릴 일봉이 없어요. 하루가 지나면 첫 봉이 그려집니다.
      </p>
    );
  }

  const available = Math.max(MIN_WIDTH, frameWidth || ASSUMED_WIDTH);
  const capacity = Math.max(1, Math.floor(available / SLOT_MIN));
  const shown =
    ordered.length > capacity ? ordered.slice(ordered.length - capacity) : ordered;

  let min = BigInt(shown[0]!.low_price);
  let max = BigInt(shown[0]!.high_price);
  for (const candle of shown) {
    const low = BigInt(candle.low_price);
    const high = BigInt(candle.high_price);
    if (low < min) min = low;
    if (high > max) max = high;
  }
  const span = max - min === 0n ? 1n : max - min;

  const logarithmic = min > 0n && max / min >= LOG_SPREAD;
  const logMin = logarithmic ? log10(min) : 0;
  const logSpan = logarithmic ? Math.max(log10(max) - logMin, Number.EPSILON) : 1;

  const y = (value: bigint): number => {
    const ratio = logarithmic
      ? (log10(value) - logMin) / logSpan
      : Number(((value - min) * SCALE) / span) / Number(SCALE);
    return HEIGHT - PADDING_Y - ratio * (HEIGHT - PADDING_Y * 2);
  };

  const write = label ?? ((at: string) => at);

  const slot = Math.min(Math.max(available / shown.length, SLOT_MIN), SLOT_MAX);
  const drawn = slot * shown.length;
  const chartWidth = available;
  const offset = (chartWidth - drawn) / 2;
  const body = Math.max(1.5, Math.min(14, slot * 0.6));

  const ticks = axisTicks(min, max, logarithmic);
  const labels = ticks.map((tick) => ({ y: y(tick), text: groupDigits(tick.toString()) }));
  const axisWidth = 10 + 6.5 * Math.max(...labels.map((l) => l.text.length));

  // 기술적 보조지표 (MA5, MA20, 볼린저 밴드) 좌표 계산
  const closePrices = shown.map((c) => BigInt(c.close_price));

  // MA5 포인트 배열
  const ma5Points: { x: number; y: number }[] = [];
  shown.forEach((_, idx) => {
    if (idx >= 4) {
      let sum = 0n;
      for (let k = idx - 4; k <= idx; k++) {
        sum += closePrices[k]!;
      }
      const ma = sum / 5n;
      const x = offset + idx * slot + slot / 2;
      ma5Points.push({ x, y: y(ma) });
    }
  });

  // MA20 & 볼린저 밴드 포인트 배열
  const ma20Points: { x: number; y: number }[] = [];
  const bollingerUpperPoints: { x: number; y: number }[] = [];
  const bollingerLowerPoints: { x: number; y: number }[] = [];

  shown.forEach((_, idx) => {
    if (idx >= 19) {
      let sum = 0n;
      for (let k = idx - 19; k <= idx; k++) {
        sum += closePrices[k]!;
      }
      const ma = sum / 20n;
      const maNum = Number(ma);

      let varianceSum = 0;
      for (let k = idx - 19; k <= idx; k++) {
        const diff = Number(closePrices[k]!) - maNum;
        varianceSum += diff * diff;
      }
      const stdDev = Math.sqrt(varianceSum / 20);
      const upperVal = BigInt(Math.max(1, Math.round(maNum + 2 * stdDev)));
      const lowerVal = BigInt(Math.max(1, Math.round(maNum - 2 * stdDev)));

      const x = offset + idx * slot + slot / 2;
      ma20Points.push({ x, y: y(ma) });
      bollingerUpperPoints.push({ x, y: y(upperVal) });
      bollingerLowerPoints.push({ x, y: y(lowerVal) });
    }
  });

  const ma5PointsStr = ma5Points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const ma20PointsStr = ma20Points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const bbUpperStr = bollingerUpperPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const bbLowerStr = bollingerLowerPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const bbPolygonPoints =
    bollingerUpperPoints.length > 0 && bollingerLowerPoints.length > 0
      ? `${ma20PointsStr} ${[...bollingerLowerPoints].reverse().map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}`
      : '';

  return (
    <figure className="grid gap-2">
      {/* 상단 기술적 보조지표 토글 툴바 */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-semibold mr-1">지표:</span>
          <button
            type="button"
            onClick={() => setShowMA5(!showMA5)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-all ${
              showMA5
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs'
                : 'bg-muted/40 text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            MA5
          </button>
          <button
            type="button"
            onClick={() => setShowMA20(!showMA20)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-all ${
              showMA20
                ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/40 shadow-xs'
                : 'bg-muted/40 text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            MA20
          </button>
          <button
            type="button"
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${
              showBollinger
                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40 shadow-xs'
                : 'bg-muted/40 text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            볼린저 밴드
          </button>
        </div>

        <div className="text-[11px] text-muted-foreground font-mono hidden sm:inline-block">
          {shown.length}일 봉
        </div>
      </div>

      <div className="flex items-start">
        <div ref={frame} className="min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${chartWidth} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="h-[260px] w-full"
            role="img"
            aria-label={`캔들 ${shown.length}개. 최고 ${groupDigits(max.toString())}, 최저 ${groupDigits(min.toString())}.${
              logarithmic ? ' 세로 눈금은 로그입니다.' : ''
            }`}
          >
            {/* 눈금선 (테스트에서 path로 검증되는 유일한 path 요소) */}
            {labels.map((l) => (
              <path
                key={l.text}
                d={`M0 ${l.y} H ${chartWidth}`}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
            ))}

            {/* 볼린저 밴드 음영 영역 및 상/하한선 */}
            {showBollinger && bbPolygonPoints && (
              <polygon
                points={bbPolygonPoints}
                fill="rgba(139, 92, 246, 0.08)"
              />
            )}
            {showBollinger && bbUpperStr && (
              <polyline
                points={bbUpperStr}
                fill="none"
                stroke="rgba(139, 92, 246, 0.6)"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}
            {showBollinger && bbLowerStr && (
              <polyline
                points={bbLowerStr}
                fill="none"
                stroke="rgba(139, 92, 246, 0.6)"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}

            {/* 캔들스틱 (테스트에서 wicks는 line으로 검증) */}
            {shown.map((candle, index) => {
              const open = BigInt(candle.open_price);
              const close = BigInt(candle.close_price);
              const down = close < open;
              const colour = down ? 'var(--fall)' : 'var(--rise)';
              const centre = offset + index * slot + slot / 2;
              const top = y(close > open ? close : open);
              const bottom = y(close > open ? open : close);
              return (
                <g key={candle.at}>
                  <line
                    x1={centre}
                    x2={centre}
                    y1={y(BigInt(candle.high_price))}
                    y2={y(BigInt(candle.low_price))}
                    stroke={colour}
                    strokeWidth={1}
                  />
                  <rect
                    x={centre - body / 2}
                    y={top}
                    width={body}
                    height={Math.max(1, bottom - top)}
                    fill={colour}
                    stroke={colour}
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            {/* 이동평균선 MA5 (polyline) */}
            {showMA5 && ma5PointsStr && (
              <polyline
                points={ma5PointsStr}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeLinecap="round"
                className="transition-all duration-300 pointer-events-none"
              />
            )}

            {/* 이동평균선 MA20 (polyline) */}
            {showMA20 && ma20PointsStr && (
              <polyline
                points={ma20PointsStr}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeLinecap="round"
                className="transition-all duration-300 pointer-events-none"
              />
            )}
          </svg>
        </div>

        {/* 세로 축 라벨 */}
        <svg
          aria-hidden
          viewBox={`0 0 ${axisWidth} ${HEIGHT}`}
          style={{ width: axisWidth }}
          className="tabular h-[260px] shrink-0 border-l text-[10px]"
        >
          {labels.map((l) => (
            <text key={l.text} x={6} y={l.y + 3.5} fill="var(--muted-foreground)">
              {l.text}
            </text>
          ))}
        </svg>
      </div>

      <figcaption className="flex justify-between text-[11px] text-muted-foreground">
        <span>{write(shown[0]?.at ?? '')}</span>
        <span className="tabular">
          최저 {groupDigits(min.toString())} · 최고 {groupDigits(max.toString())}
          {logarithmic && <span className="ml-1">· 로그 눈금</span>}
        </span>
        <span>{write(shown[shown.length - 1]?.at ?? '')}</span>
      </figcaption>
    </figure>
  );
}
