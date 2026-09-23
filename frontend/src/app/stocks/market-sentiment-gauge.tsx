'use client';

import React from 'react';
import { Gauge, TrendingUp, TrendingDown, Newspaper, Sparkles, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MarketEvent } from './market-news';

interface MarketSentimentGaugeProps {
  readonly events: readonly MarketEvent[];
  readonly isEn?: boolean;
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
}

export function computeMarketSentiment(events: readonly MarketEvent[]): SentimentAnalysis {
  if (events.length === 0) {
    return {
      score: 50,
      label: '중립 (Neutral)',
      color: '#71717a',
      totalPositive: 0,
      totalNegative: 0,
      stockSentiments: [],
    };
  }

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
  // 0 ~ 100 점 정규화 (50점이 중립)
  const score = grandTotal > 0
    ? Math.round((totalBullWeight / grandTotal) * 100)
    : 50;

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
  };
}

export function MarketSentimentGauge({
  events,
  isEn = false,
}: MarketSentimentGaugeProps) {
  const analysis = computeMarketSentiment(events);

  return (
    <Card className="border-border/80 bg-card/60 shadow-xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 bg-muted/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            <CardTitle className="text-sm font-bold">
              {isEn ? 'AI Market Sentiment & Pulse' : 'AI 뉴스 기반 시장 감성 지수'}
            </CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-[11px] gap-1">
            <Sparkles className="size-3 text-amber-500" />
            <span>{isEn ? 'Llama 3.2 Newsroom' : '로컬 AI 뉴스룸 분석'}</span>
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-0.5">
          {isEn
            ? 'Real-time greed & fear sentiment derived from automated AI news broadcasts.'
            : '5분 주기로 발행되는 AI 시장 기사를 바탕으로 실시간 탐욕/공포 심리를 정밀 측정합니다.'}
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
                  <span className="text-[10px] opacity-75">
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
