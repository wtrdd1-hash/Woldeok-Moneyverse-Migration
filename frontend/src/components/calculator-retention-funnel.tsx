'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, Bookmark, BookmarkCheck, CalendarCheck, TrendingUp } from 'lucide-react';

interface CalculatorRetentionFunnelProps {
  readonly stockName: string;
  readonly ticker: string;
  readonly targetPrice: string;
  readonly reboundRate: string;
  readonly category?: string;
}

interface SavedScenario {
  readonly ticker: string;
  readonly stockName: string;
  readonly targetPrice: string;
  readonly reboundRate: string;
  readonly savedAt: number;
}

const STORAGE_KEY = 'wdmv_saved_scenarios';

export function CalculatorRetentionFunnel({
  stockName,
  ticker,
  targetPrice,
  reboundRate,
  category = 'stock',
}: CalculatorRetentionFunnelProps) {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const isCompound = category === 'compound';

  useEffect(() => {
    setSaved(false);
    setMessage(null);
    try {
      const items: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(items)) {
        setSaved(items.some((item: unknown) =>
          typeof item === 'object' && item !== null && 'ticker' in item && item.ticker === ticker,
        ));
      }
    } catch {
      // Storage is optional. The page remains usable without it.
    }
  }, [ticker]);

  function saveInBrowser() {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(stored)) throw new Error('invalid browser data');
      const item: SavedScenario = { ticker, stockName, targetPrice, reboundRate, savedAt: Date.now() };
      const updated = [item, ...stored.filter((value: unknown) =>
        typeof value === 'object' && value !== null && 'ticker' in value && value.ticker !== ticker,
      )].slice(0, 30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSaved(true);
      setMessage({ text: '계산 결과를 이 브라우저에만 저장했습니다. 캐시를 지우면 사라지며 계정이나 서버에는 동기화되지 않습니다.', error: false });
    } catch {
      setMessage({ text: '브라우저에 계산 결과를 저장하지 못했습니다. 저장 공간이나 브라우저 설정을 확인해 주세요.', error: true });
    }
  }

  return (
    <section aria-label="계산 결과 보관 및 가상 거래소 안내" className="w-full space-y-5 border-t border-border/80 pt-6">
      <div className="space-y-4 rounded-2xl border border-emerald-500/30 bg-card p-5 sm:p-6">
        <h2 className="text-base font-bold sm:text-lg">{isCompound ? '복리 계산 결과 보관' : `${stockName} 계산 결과 보관`}</h2>
        <p className="text-sm text-muted-foreground">예상 결과 {targetPrice} · 가정한 변화 {reboundRate}. 계산 결과는 참고용이며 실제 금융 수익을 보장하지 않습니다.</p>
        <p className="text-sm text-muted-foreground">저장은 이 브라우저에서만 가능합니다. 계정 동기화·자동 목표 알림은 이 버튼으로 등록되지 않습니다.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={saveInBrowser}
            disabled={saved}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-70"
          >
            {saved ? <BookmarkCheck aria-hidden="true" className="size-4" /> : <Bookmark aria-hidden="true" className="size-4" />}
            {saved ? '브라우저에 저장됨' : '이 브라우저에 저장'}
          </button>
          {!isCompound ? (
            <Link href={`/stocks/alerts?stock=${encodeURIComponent(ticker)}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <Bell aria-hidden="true" className="size-4" /> 조건부 알림 설정 <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : (
            <p className="self-center text-xs text-muted-foreground">만기 알림은 아직 제공되지 않습니다. 저장한 계산 결과는 자동으로 감시되지 않습니다.</p>
          )}
        </div>
        {message ? <p role={message.error ? 'alert' : 'status'} className={`text-sm ${message.error ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>{message.text}</p> : null}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-base font-bold">가상 거래소에서 직접 살펴보기</h2>
        <p className="mt-2 text-sm text-muted-foreground">머니버스의 WLD와 주식은 게임 속 가상 데이터입니다. 가입·계산·이동만으로 WLD가 지급되거나 주문이 체결되지 않습니다.</p>
        <Link href="/stocks" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          가상 거래소 보기 <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><CalendarCheck aria-hidden="true" className="size-4" /> 가상 경제 이용 안내</h3>
          <p className="mt-2 text-xs text-muted-foreground">가상 경제 기능의 실제 참여 조건과 보상은 각 서비스 화면에서 확인해 주세요.</p>
          <Link href="/roadmap" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">서비스 안내 <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><TrendingUp aria-hidden="true" className="size-4" /> 가상 직업과 저축</h3>
          <p className="mt-2 text-xs text-muted-foreground">직업·저축 상품의 이용 조건을 먼저 살펴보세요. 예상 수익은 실제 지급 영수증이 아닙니다.</p>
          <Link href="/career-guide" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">직업 가이드 <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
