'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, LineChart, Landmark, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BlogRelatedEcosystemProps {
  readonly relatedCalculatorHref: string;
  readonly relatedCalculatorName: string;
  readonly relatedStockTicker?: string | undefined;
  readonly category: string;
}

/**
 * 블로그 본문 주제와 1:1 매칭되는 머니버스 3대 추천 도구 및 관련 가상 주식 퀵 카드 그리드
 */
export function BlogRelatedEcosystem({
  relatedCalculatorHref,
  relatedCalculatorName,
  relatedStockTicker = 'CHIPS',
  category,
}: BlogRelatedEcosystemProps) {
  return (
    <div className="my-10 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          이 글과 함께 활용하면 좋은 머니버스 핵심 도구
        </h4>
        <Link
          href="/tools"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          300+개 도구 전체보기
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* 1. 본문 매칭 정밀 계산기 */}
        <Link href={relatedCalculatorHref} className="group">
          <Card className="h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-blue-500/50 hover:shadow-md transition-all">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calculator className="w-4 h-4" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  CALCULATOR
                </Badge>
              </div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                {relatedCalculatorName}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                정부 세제 혜택 및 복리 공식을 100% 반영한 1초 시뮬레이터.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 2. 가상 주식 거래소 티커 */}
        <Link href={`/stocks/${relatedStockTicker}`} className="group">
          <Card className="h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-emerald-500/50 hover:shadow-md transition-all">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <LineChart className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 border-emerald-500/30">
                  {relatedStockTicker}
                </Badge>
              </div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
                가상 주식 실시간 차트
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                TradingView급 호가창과 보조지표로 모의 분할 매수를 실습하세요.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 3. 복리 정기예금 / AI 어드바이저 */}
        <Link href={category === 'WEALTH' ? '/advisor' : '/bank'} className="group">
          <Card className="h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-purple-500/50 hover:shadow-md transition-all">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Landmark className="w-4 h-4" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {category === 'WEALTH' ? 'ADVISOR' : 'BANK'}
                </Badge>
              </div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 transition-colors">
                {category === 'WEALTH' ? '덕이 AI 포트폴리오 진단' : '복리 정기예금 금고'}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                KDIC 예금자 보호 원장으로 원금을 지키며 안정적인 이자를 수령하세요.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
