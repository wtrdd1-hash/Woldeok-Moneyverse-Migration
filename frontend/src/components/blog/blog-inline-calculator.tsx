'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BlogInlineCalculatorProps {
  readonly defaultPrincipal?: number;
  readonly defaultRate?: number;
  readonly defaultYears?: number;
  readonly fullCalculatorHref?: string;
  readonly fullCalculatorName?: string;
}

/**
 * 블로그 본문 중간에 인라인으로 임베드되는 인터랙티브 미니 복리 시뮬레이터 위젯
 * 독자가 직접 슬라이더를 움직이며 복리 효과를 체감하고 서비스 풀버전 계산기로 전환되도록 유도
 */
export function BlogInlineCalculator({
  defaultPrincipal = 500, // 500만 원 (또는 500만 WLD)
  defaultRate = 7, // 7% 연이율
  defaultYears = 10, // 10년
  fullCalculatorHref = '/tools/compound-calculator',
  fullCalculatorName = '월덕 머니버스 복리 계산기',
}: BlogInlineCalculatorProps) {
  const [principal, setPrincipal] = useState<number>(defaultPrincipal);
  const [rate, setRate] = useState<number>(defaultRate);
  const [years, setYears] = useState<number>(defaultYears);

  // 복리 미래가치 계산: FV = P * (1 + r)^t
  const result = useMemo(() => {
    const fv = principal * Math.pow(1 + rate / 100, years);
    const profit = fv - principal;
    const profitRate = principal > 0 ? (profit / principal) * 100 : 0;
    return {
      futureValue: Math.round(fv),
      profit: Math.round(profit),
      profitRate: profitRate.toFixed(1),
    };
  }, [principal, rate, years]);

  return (
    <Card className="my-8 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 via-zinc-50/60 to-teal-50/30 dark:from-emerald-950/20 dark:via-zinc-900/80 dark:to-teal-950/10 shadow-md overflow-hidden">
      <CardHeader className="pb-3 border-b border-emerald-500/10 dark:border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                인터랙티브 실전 복리 시뮬레이터
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> Live
                </span>
              </CardTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                슬라이더를 움직여 내 원금이 복리로 불어나는 눈덩이 효과를 확인해 보세요.
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 초기 투자금 */}
          <div className="space-y-1.5 bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">초기 원금</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {principal.toLocaleString()}만 원
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* 연 수익률 */}
          <div className="space-y-1.5 bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">예상 연이율</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {rate}%
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* 투자 기간 */}
          <div className="space-y-1.5 bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">투자 기간</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {years}년
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 결과 요약 보드 */}
        <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              {years}년 뒤 예상 복리 만기 자산
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {result.futureValue.toLocaleString()}{' '}
              <span className="text-sm font-sans font-normal text-zinc-600 dark:text-zinc-300">
                만 원
              </span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-emerald-500/20 sm:pl-4">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">순이자 수익</div>
            <div className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
              +{result.profit.toLocaleString()}만 원 (+{result.profitRate}%)
            </div>
          </div>
        </div>

        {/* 풀버전 도구 CTA */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            * 세제 혜택(ISA/연금저축 비과세) 및 월 적립식 복리는 풀버전 계산기에서 지원합니다.
          </p>
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm w-full sm:w-auto">
            <Link href={fullCalculatorHref}>
              {fullCalculatorName} 정밀 분석
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
