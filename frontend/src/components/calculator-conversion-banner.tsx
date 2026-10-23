'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalculatorConversionBannerProps {
  readonly title?: string;
  readonly description?: string;
  readonly targetSymbol?: string;
  readonly targetUrl?: string;
  /** Legacy presentation prop; no reward is implied without a verified ledger receipt. */
  readonly bonusAmount?: string;
}

export function CalculatorConversionBanner({
  title = '계산한 시나리오를 가상 거래소에서 살펴보세요',
  description = '가상 종목과 호가 정보를 확인하고 직접 주문할 수 있습니다. 계산 결과나 회원가입은 WLD 지급 또는 주문 체결을 뜻하지 않습니다.',
  targetSymbol = 'CHIPS',
  targetUrl,
}: CalculatorConversionBannerProps) {
  const destination = targetUrl?.startsWith('/stocks') && !targetUrl.startsWith('//')
    ? targetUrl
    : targetSymbol ? `/stocks/${encodeURIComponent(targetSymbol)}` : '/stocks';

  return (
    <section aria-label="가상 거래소 안내" className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 shadow-xl sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
          <p className="text-sm leading-relaxed text-slate-200">{description}</p>
          <p className="text-xs leading-relaxed text-slate-300">가입만으로 WLD 보상은 확정되지 않습니다. 가상 주식과 WLD는 실제 투자 상품이나 현금이 아니며, 결과는 서버에서 확인해야 합니다.</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1"><ShieldCheck aria-hidden="true" className="size-4" /> 게임 속 가상 데이터</span>
            <span className="inline-flex items-center gap-1"><TrendingUp aria-hidden="true" className="size-4" /> 가상 종목 정보</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
          <Button asChild size="lg" className="min-h-11 w-full bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-500">
            <Link href={destination}>{targetSymbol ? `${targetSymbol} 가상 종목 보기` : '가상 거래소 보기'} <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="min-h-11 w-full border-slate-600 bg-slate-800 text-xs text-white hover:bg-slate-700">
            <Link href="/register">회원가입 안내</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
