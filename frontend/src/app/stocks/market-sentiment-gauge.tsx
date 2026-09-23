'use client';

import React from 'react';
import { Gauge, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MarketEvent } from './market-news';

export interface MarketSentimentFactors {
  readonly priceChange24hPct?: number;
  readonly volumeScore?: number;
  readonly orderPressureBidRatio?: number;
}

export interface FactorBreakdown {
  readonly newsScore: number;
  readonly momentumScore: number;
  readonly volumeScore: number;
  readonly orderPressureScore: number;
}

export interface SentimentAnalysis {
  readonly score: number;
  readonly label: string;
  readonly color: string;
  readonly totalPositive: number;
  readonly totalNegative: number;
  readonly stockSentiments: ReadonlyArray<{
    readonly symbol: string;
    readonly name: string;
    readonly direction: 'up' | 'down';
    readonly strength: number;
  }>;
  readonly factorScores: FactorBreakdown;
}

interface MarketSentimentGaugeProps {
  readonly events: readonly MarketEvent[];
  readonly marketFactors?: MarketSentimentFactors;
  readonly isEn?: boolean;
}

/**
 * CNN Fear & Greed / Alternative.me 다요소 가중 모델 기반 시장 감성 지수 산출
 * - AI 뉴스 감성 (40%)
 * - 24시간 가격 변동성/모멘텀 (30%)
 * - 거래량 활성도 (20%)
 * - 호가창 매수/매도 잔량 압력비 (10%)
 */
export function computeMarketSentiment(
  events: readonly MarketEvent[],
  factors?: MarketSentimentFactors,
): SentimentAnalysis {
  let totalBullWeight = 0;
  let totalBearWeight = 0;
  let totalPositive = 0;
  let totalNegative = 0;

  const stockMap = new Map<string, { symbol: string; name: string; direction: 'up' | 'down'; strength: number }>();

  for (const ev of events) {
    const weight = ev.strength || 1;
    if (ev.direction === 'up') {
      totalBullWeight += weight;
      totalPositive += 1;
    } else {
      totalBearWeight += weight;
      totalNegative += 1;
    }

    if (ev.symbol) {
      stockMap.set(ev.symbol, {
        symbol: ev.symbol,
        name: ev.name || ev.symbol,
        direction: ev.direction,
        strength: ev.strength,
      });
    }
  }

  const grandTotal = totalBullWeight + totalBearWeight;
  // Factor 1: AI 뉴스 스코어 (0 ~ 100, 뉴스가 없으면 50점 중립)
  const newsScore = grandTotal > 0
    ? Math.round((totalBullWeight / grandTotal) * 100)
    : 50;

  // Factor 2: 24시간 가격 모멘텀 (30% 가중치, -15%~+15% 등락률을 0~100으로 정규화)
  const priceChange = factors?.priceChange24hPct ?? 0;
  const momentumScore = Math.min(100, Math.max(0, Math.round(50 + (priceChange * 3.33))));

  // Factor 3: 거래량 서지/모멘텀 (20% 가중치, 기본 50)
  const volumeScore = factors?.volumeScore !== undefined
    ? Math.min(100, Math.max(0, Math.round(factors.volumeScore)))
    : 50;

  // Factor 4: 호가창 매수/매도 잔량 압력비 (10% 가중치, 기본 50)
  const orderPressureScore = factors?.orderPressureBidRatio !== undefined
    ? Math.min(100, Math.max(0, Math.round(factors.orderPressureBidRatio)))
    : 50;

  const hasExternalFactors = factors !== undefined && (
    factors.priceChange24hPct !== undefined ||
    factors.volumeScore !== undefined ||
    factors.orderPressureBidRatio !== undefined
  );

  // 종합 스코어 계산 (외부 팩터가 전달되면 40:30:20:10 결합, 없으면 뉴스 기준)
  const score = hasExternalFactors
    ? Math.min(100, Math.max(0, Math.round(
        (newsScore * 0.40) +
        (momentumScore * 0.30) +
        (volumeScore * 0.20) +
        (orderPressureScore * 0.10)
      )))
    : newsScore;

  let label = '중립 (Neutral)';
  let color = '#71717a';

  if (score >= 75) {
    label = '극단적 탐욕 (Extreme Greed)';
    color = '#06b6d4'; // Cyan
  } else if (score >= 58) {
    label = '탐욕 (Greed)';
    color = '#10b981'; // Emerald
  } else if (score <= 25) {
    label = '극단적 공포 (Extreme Fear)';
    color = '#e11d48'; // Rose
  } else if (score <= 42) {
    label = '공포 (Fear)';
    color = '#f59e0b'; // Amber
  }

  return {
    score,
    label,
    color,
    totalPositive,
    totalNegative,
    stockSentiments: Array.from(stockMap.values()),
    factorScores: {
      newsScore,
      momentumScore,
      volumeScore,
      orderPressureScore,
    },
  };
}

export function MarketSentimentGauge({
  events,
  marketFactors,
  isEn = false,
}: MarketSentimentGaugeProps) {
  const analysis = computeMarketSentiment(events, marketFactors);

  return (
    <Card className="border-border/80 bg-card/60 shadow-xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 bg-muted/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            <CardTitle className="text-sm font-bold">
              {isEn ? 'AI Market Sentiment & Pulse' : 'AI 뉴스 & 다요소 시장 감성 지수'}
            </CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-[11px] gap-1">
            <Sparkles className="size-3 text-amber-500" />
            <span>{isEn ? 'Multi-Factor Engine' : '다요소 복합 분석'}</span>
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-0.5">
          {isEn
            ? 'Derived from AI news (40%), price momentum (30%), volume surge (20%), and order pressure (10%).'
            : 'AI 뉴스(40%), 24h 가격 모멘텀(30%), 거래량(20%), 호가 잔량 압력(10%)을 결합하여 실시간 탐욕/공포 심리를 정밀 측정합니다.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* 센티멘트 스코어 및 핀테크 프로그레스 게이지 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl border border-border/60 bg-muted/20">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-semibold text-muted-foreground">
              {isEn ? 'Current Sentiment Score' : '현재 시장 심리 상태'}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-mono text-3xl font-extrabold text-foreground">
                {analysis.score}
              </span>
              <span className="text-xs font-mono text-muted-foreground">/ 100</span>
              <Badge
                variant="outline"
                className="font-bold text-xs px-2 py-0.5"
                style={{ borderColor: `${analysis.color}60`, color: analysis.color }}
              >
                {analysis.label}
              </Badge>
            </div>
          </div>

          {/* 호재 / 악재 요약 칩 */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              <TrendingUp className="size-3.5" />
              <span>호재 {analysis.totalPositive}건</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
              <TrendingDown className="size-3.5" />
              <span>악재 {analysis.totalNegative}건</span>
            </div>
          </div>
        </div>

        {/* 5단계 감성 레인지 바 (0~100) */}
        <div className="space-y-1.5">
          <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-muted/60 flex shadow-inner">
            <div className="h-full w-1/4 bg-rose-500/80" title="극단적 공포 (0-25)" />
            <div className="h-full w-1/4 bg-amber-500/80" title="공포 (25-50)" />
            <div className="h-full w-1/4 bg-emerald-500/80" title="탐욕 (50-75)" />
            <div className="h-full w-1/4 bg-cyan-500/80" title="극단적 탐욕 (75-100)" />

            {/* 현재 스코어 포인터 인디케이터 */}
            <div
              className="absolute top-0 bottom-0 w-1.5 bg-foreground rounded-full shadow-md transition-all duration-700 -translate-x-1/2"
              style={{ left: `${Math.min(98, Math.max(2, analysis.score))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-0.5">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">극단적 공포</span>
            <span>중립 (50)</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">극단적 탐욕</span>
          </div>
        </div>

        {/* 4대 다요소 기여도 브레이크다운 */}
        <div className="pt-2 border-t border-border/50 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span>{isEn ? 'Multi-Factor Breakdown' : '다요소 복합 가중치 분석 (4대 팩터)'}</span>
            <span className="font-mono text-[10px] opacity-75">CNN &amp; Alternative.me 모델</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{isEn ? 'AI News (40%)' : 'AI 뉴스 (40%)'}</div>
              <div className="font-mono font-bold text-xs text-foreground mt-0.5">{analysis.factorScores.newsScore}점</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{isEn ? 'Momentum (30%)' : '가격 모멘텀 (30%)'}</div>
              <div className="font-mono font-bold text-xs text-foreground mt-0.5">{analysis.factorScores.momentumScore}점</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{isEn ? 'Volume (20%)' : '거래량 모멘텀 (20%)'}</div>
              <div className="font-mono font-bold text-xs text-foreground mt-0.5">{analysis.factorScores.volumeScore}점</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{isEn ? 'Order Pressure (10%)' : '호가 잔량압력 (10%)'}</div>
              <div className="font-mono font-bold text-xs text-foreground mt-0.5">{analysis.factorScores.orderPressureScore}점</div>
            </div>
          </div>
        </div>

        {/* 종목별 영향 뉴스 태그 리스트 */}
        {analysis.stockSentiments.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-border/60">
            <div className="text-xs font-semibold text-muted-foreground">
              {isEn ? 'Active Stock Impacts' : '종목별 영향 소식'}
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.stockSentiments.map((st) => (
                <div
                  key={st.symbol}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-medium ${
                    st.direction === 'up'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <span className="font-bold">{st.symbol}</span>
                  <span>{st.direction === 'up' ? '▲ 호재' : '▼ 악재'}</span>
                  <span className="text-[10px] opacity-70">
                    ({st.strength === 3 ? '강력' : st.strength === 2 ? '보통' : '소폭'})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
