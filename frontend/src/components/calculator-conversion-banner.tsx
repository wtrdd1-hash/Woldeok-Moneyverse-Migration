'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalculatorConversionBannerProps {
  readonly title?: string;
  readonly description?: string;
  readonly targetSymbol?: string;
  readonly targetUrl?: string;
  readonly bonusAmount?: string;
}

export function CalculatorConversionBanner({
  title = '계산된 전략, 실전 가상 투자로 지금 바로 검증해보세요!',
  description = '신규 가입 즉시 10,000 WLD 투자 지원금 100% 무료 지급! 실제 손실 위험 없이 실시간 호가창에서 모의투자를 시작하세요.',
  targetSymbol = 'CHIPS',
  targetUrl,
  bonusAmount = '10,000 WLD',
}: CalculatorConversionBannerProps) {
  const destination = targetUrl || (targetSymbol ? `/stocks/${targetSymbol}` : '/stocks');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 shadow-xl backdrop-blur-xl sm:p-8">
      {/* Background glowing ambient effect */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Gift className="size-3.5 animate-bounce" />
            <span>신규 회원 웰컴 혜택: {bonusAmount} 즉시 지급</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="size-5 text-amber-400 shrink-0" />
            <span>{title}</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>100% 안전한 무손실 가상 모의투자</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="size-4 text-cyan-400" />
              <span>실시간 10-Depth 호가창 & 캔들 차트</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <Button
            asChild
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 text-sm gap-2"
          >
            <Link href={destination}>
              <span>{targetSymbol ? `${targetSymbol} 실전 모의투자 시작` : '가상 거래소 입장하기'}</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs"
          >
            <Link href="/register">
              1초 간편 회원가입하고 지원금 받기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
