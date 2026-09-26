'use client';

import React from 'react';
import Link from 'next/link';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Flame,
  Coins,
  Award,
  Crown,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { groupDigits } from '@/lib/money';
import { cn } from '@/lib/cn';

export interface WeeklyBriefData {
  readonly weekNumber: number;
  readonly period: string;
  readonly oneLiner: string;
  readonly m0Supply: number;
  readonly weeklySinkAmount: number;
  readonly inflationRate: number; // e.g. +1.4%
  readonly topTradedStocks: readonly {
    readonly rank: number;
    readonly symbol: string;
    readonly name: string;
    readonly volume: number;
    readonly changeRate: string;
  }[];
  readonly weeklyLeaders: readonly {
    readonly category: string;
    readonly name: string;
    readonly value: string;
    readonly badge: string;
  }[];
  readonly learningInsight: {
    readonly title: string;
    readonly takeaway: string;
    readonly actionTip: string;
  };
}

export const DEFAULT_WEEKLY_BRIEF: WeeklyBriefData = {
  weekNumber: 39,
  period: '2026년 9월 4주차',
  oneLiner: '가상 주식 거래량 24% 급증과 함께 도시 공공 프로젝트 기여로 42만 WLD가 영구 소각되어 M0 유동성이 매우 건전하게 유지되고 있습니다.',
  m0Supply: 12450000,
  weeklySinkAmount: 421500,
  inflationRate: 1.4,
  topTradedStocks: [
    { rank: 1, symbol: 'CHIPS', name: '가상 반도체 홀딩스', volume: 48200, changeRate: '+4.8%' },
    { rank: 2, symbol: 'SPACE', name: '스페이스 오빗 탐사선', volume: 31500, changeRate: '+12.5%' },
    { rank: 3, symbol: 'BIO', name: '바이오 넥스트랩', volume: 24100, changeRate: '-1.8%' },
  ],
  weeklyLeaders: [
    { category: '주간 최다 소각 기여', name: '월덕파운더', value: '150,000 WLD 소각', badge: '도시 건립자' },
    { category: '주간 주식 수익률 1위', name: '알파헌터', value: '+34.8% 순익', badge: '트레이딩 마스터' },
    { category: '주간 직업 업무 성실왕', name: '메트로배달부', value: '182건 업무 완료', badge: '시민의 발' },
  ],
  learningInsight: {
    title: '이번 주 금융 한 줄: 매몰비용의 오류(Sunk Cost Fallacy)와 분산 투자',
    takeaway: '이미 지출된 비용에 집착하여 손실 중인 단일 종목에 무리하게 추가 매수를 거듭하기보다, 정기적인 포트폴리오 리밸런싱과 가상 은행 세이빙 포켓 분산 예치를 통해 리스크를 체계적으로 헤지하는 것이 자산 보존의 핵심입니다.',
    actionTip: '보유 주식 중 목표가에 도달했거나 비중이 과도한 종목을 일부 실현하고 은행 고금리 적금 포켓으로 안전 자산을 확보하세요.',
  },
};

export function WeeklyWorldBrief({
  data = DEFAULT_WEEKLY_BRIEF,
}: {
  readonly data?: WeeklyBriefData;
}) {
  return (
    <div className="space-y-6">
      {/* 1. 이번 주 한 문장 히어로 배너 */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary text-primary-foreground">
                <Newspaper className="size-4" />
              </span>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                WEEKLY WORLD BRIEF · {data.period}
              </span>
              <Badge variant="outline" className="text-[10px] font-bold border-primary/40 text-primary">
                제{data.weekNumber}호
              </Badge>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-foreground leading-snug">
              &ldquo;{data.oneLiner}&rdquo;
            </h3>
            <p className="text-xs text-muted-foreground">
              머니버스 통계청 & AI Council이 매주 집계하는 공공 거시경제 리포트입니다. (모든 자산은 가상 게임 데이터입니다)
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/stocks">
              <Button size="sm" className="h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                <span>거래소 바로가기</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 의미 있는 3대 핵심 거시경제 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* M0 통화량 & 소각량 */}
        <Card className="rounded-2xl border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Coins className="size-4 text-amber-500" />
                <span>M0 통화 유동성</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-rose-500/30 text-rose-500 bg-rose-500/10">
                소각량 우수
              </Badge>
            </div>
            <CardTitle className="text-xl font-black mt-2 text-foreground font-mono">
              {groupDigits(data.m0Supply)} WLD
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              주간 총 유통 통화량
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-4 pt-2 border-t text-xs flex items-center justify-between text-muted-foreground">
            <span>주간 영구 소각량:</span>
            <span className="font-mono font-bold text-rose-500 flex items-center gap-1">
              <Flame className="size-3.5" />
              -{groupDigits(data.weeklySinkAmount)} WLD
            </span>
          </CardFooter>
        </Card>

        {/* 인플레이션율 게이지 */}
        <Card className="rounded-2xl border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Activity className="size-4 text-primary" />
                <span>주간 물가/통화 팽창률</span>
              </span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                건전 성장 구간
              </Badge>
            </div>
            <CardTitle className="text-xl font-black mt-2 text-foreground font-mono flex items-baseline gap-1.5">
              <span>+{data.inflationRate}%</span>
              <span className="text-xs font-normal text-muted-foreground">/ 주간</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              기준 적정 목표치 (0.5% ~ 2.0%) 내 안정 유지
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-4 pt-2 border-t text-xs flex items-center justify-between text-muted-foreground">
            <span>AI Council 통화 정책:</span>
            <span className="font-bold text-emerald-500">안정적 확장 유지</span>
          </CardFooter>
        </Card>

        {/* 최다 거래 주식 1위 */}
        <Card className="rounded-2xl border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <BarChart3 className="size-4 text-emerald-500" />
                <span>주간 최다 거래 종목</span>
              </span>
              <Badge className="text-[10px] bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                거래량 1위
              </Badge>
            </div>
            <CardTitle className="text-xl font-black mt-2 text-foreground font-mono flex items-center gap-2">
              <span>{data.topTradedStocks[0]?.symbol}</span>
              <span className="text-xs font-bold text-emerald-500">{data.topTradedStocks[0]?.changeRate}</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate">
              {data.topTradedStocks[0]?.name}
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-4 pt-2 border-t text-xs flex items-center justify-between text-muted-foreground">
            <span>주간 총 거래량:</span>
            <span className="font-mono font-bold text-foreground">
              {groupDigits(data.topTradedStocks[0]?.volume ?? 0)}주
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* 3. 최다 거래 종목 TOP 3 & 주간 명예 리더보드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 거래량 TOP 3 종목 테이블 */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <span>주간 거래량 상위 종목 TOP 3</span>
              </CardTitle>
              <Link href="/stocks" className="text-xs text-primary font-bold hover:underline">
                전체 종목 보기 →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="divide-y divide-border/40">
              {data.topTradedStocks.map((st) => (
                <div key={st.symbol} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-xs text-muted-foreground size-5 flex items-center justify-center rounded-md bg-muted">
                      {st.rank}
                    </span>
                    <div>
                      <div className="font-bold text-foreground font-mono flex items-center gap-1.5">
                        <span>{st.symbol}</span>
                        <span className="text-xs font-normal text-muted-foreground">· {st.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-foreground">{groupDigits(st.volume)}주</div>
                    <div className={cn(
                      'text-xs font-mono font-bold',
                      st.changeRate.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'
                    )}>
                      {st.changeRate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 주간 명예 리더보드 (Hall of Fame) */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Crown className="size-4 text-amber-500" />
                <span>주간 경제 명예의 전당 (Weekly Hall of Fame)</span>
              </CardTitle>
              <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                주간 MVP
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="divide-y divide-border/40">
              {data.weeklyLeaders.map((ldr) => (
                <div key={ldr.category} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <div className="text-[11px] font-bold text-muted-foreground">{ldr.category}</div>
                    <div className="font-bold text-foreground mt-0.5 flex items-center gap-2">
                      <span>{ldr.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                        {ldr.badge}
                      </Badge>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-primary text-right">
                    {ldr.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. 이번 주 가상경제 학습 인사이트 & 실천 팁 */}
      <Card className="rounded-2xl border-border/80 bg-gradient-to-r from-muted/30 via-background to-muted/20 shadow-xs">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-500">
              <Lightbulb className="size-4" />
            </span>
            <CardTitle className="text-base font-bold text-foreground">
              {data.learningInsight.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>{data.learningInsight.takeaway}</p>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-xs text-foreground flex items-start gap-2.5">
            <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-primary font-bold">금주의 추천 액션: </strong>
              <span>{data.learningInsight.actionTip}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 flex flex-wrap gap-2">
          <Link href="/bank">
            <Button variant="outline" size="sm" className="h-9 text-xs font-bold">
              가상 은행 저축 포켓 둘러보기
            </Button>
          </Link>
          <Link href="/work">
            <Button variant="outline" size="sm" className="h-9 text-xs font-bold">
              직업 업무로 기본 자금 모으기
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
