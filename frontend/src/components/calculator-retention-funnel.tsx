'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bookmark, BookmarkCheck, TrendingUp } from 'lucide-react';

interface CalculatorRetentionFunnelProps {
  readonly stockName: string;
  readonly ticker: string;
  readonly targetPrice: string;
  readonly reboundRate: string;
  readonly category?: string;
}

type SavedScenario = {
  ticker: string;
  stockName: string;
  targetPrice: string;
  reboundRate: string;
  savedAt: number;
};

/** This component saves to this browser only. It never registers an alert or credits WLD. */
export function CalculatorRetentionFunnel({
  stockName,
  ticker,
  targetPrice,
  reboundRate,
  category = 'stock',
}: CalculatorRetentionFunnelProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const isCompound = category === 'compound';

  useEffect(() => {
    setIsSaved(false);
    setFeedback(null);
    try {
      const raw = localStorage.getItem('wdmv_saved_scenarios');
      const scenarios: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(scenarios)) {
        setIsSaved(scenarios.some(item => item && typeof item === 'object' && item.ticker === ticker));
      }
    } catch {
      // Private mode or malformed storage: never infer a successful save.
    }
  }, [ticker]);

  const handleSave = () => {
    try {
      const raw = localStorage.getItem('wdmv_saved_scenarios');
      const stored: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(stored)) throw new Error('Invalid saved scenarios');
      const scenario: SavedScenario = { ticker, stockName, targetPrice, reboundRate, savedAt: Date.now() };
      const updated = [scenario, ...stored.filter(item => item && typeof item === 'object' && item.ticker !== ticker)].slice(0, 30);
      localStorage.setItem('wdmv_saved_scenarios', JSON.stringify(updated));
      setIsSaved(true);
      setFeedback({ message: '계산 결과를 이 브라우저에 저장했습니다. 계정 동기화나 알림은 설정되지 않습니다.', error: false });
    } catch {
      setIsSaved(false);
      setFeedback({ message: '계산 결과를 저장하지 못했습니다. 브라우저 저장 공간과 설정을 확인해 주세요.', error: true });
    }
  };

  return (
    <section className="w-full space-y-4 border-t border-border/80 pt-6" aria-label="계산 결과 보관 및 가상 경제 안내">
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">이 기기에서만 보관</p>
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            {stockName} {isCompound ? '만기 예상 자산' : '목표 가격'} {targetPrice} 계산 결과
          </h2>
          <p className="text-sm text-muted-foreground">
            브라우저에 계산값을 저장할 수 있습니다. 다른 기기 동기화, 목표가 알림, 가상화폐 지급은 제공되지 않습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaved}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default disabled:opacity-65"
        >
          {isSaved ? <BookmarkCheck aria-hidden="true" className="size-4" /> : <Bookmark aria-hidden="true" className="size-4" />}
          {isSaved ? '저장 완료 (이 브라우저)' : '이 브라우저에 저장'}
        </button>
        {feedback && (
          <p role={feedback.error ? 'alert' : 'status'} className={feedback.error ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
            {feedback.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <TrendingUp aria-hidden="true" className="size-4" /> 가상 주식 서비스 둘러보기
          </h2>
          <p className="text-sm text-muted-foreground">
            계산 결과는 가상 거래 주문이 아닙니다. 거래 가능 여부와 잔액은 로그인 후 실제 서비스에서 확인하세요.
          </p>
        </div>
        <Link
          href="/stocks"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          가상 주식 서비스 둘러보기 <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <nav aria-label="추가 학습 자료" className="flex flex-wrap gap-4 text-sm">
        <Link href="/roadmap" className="min-h-11 py-3 text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">서비스 이용 안내</Link>
        <Link href="/career-guide" className="min-h-11 py-3 text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">직업 가이드</Link>
      </nav>
    </section>
  );
}
