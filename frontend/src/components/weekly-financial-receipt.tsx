'use client';

import React, { useState } from 'react';
import {
  Receipt,
  TrendingUp,
  Award,
  Sparkles,
  Share2,
  CheckCircle2,
  Flame,
  PieChart,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatWld } from '@/lib/money';
import { TranslatedText as T } from '@/components/translated-text';

export interface WeeklyFinancialSummary {
  readonly weekNumber: number;
  readonly periodLabel: string;
  readonly totalTurnoverWld: string;
  readonly realizedGainWld: string;
  readonly returnRatePct: string;
  readonly topStockSymbol: string;
  readonly topStockReturnPct: string;
  readonly tradeCount: number;
  readonly feeBurnContributionWld: string;
  readonly diversificationScore: number;
  readonly traderPersona: string;
}

export function WeeklyFinancialReceipt({
  data,
}: {
  readonly data?: WeeklyFinancialSummary;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const summary: WeeklyFinancialSummary = data ?? {
    weekNumber: 40,
    periodLabel: '2026.09.28 ~ 2026.10.03',
    totalTurnoverWld: '48,500',
    realizedGainWld: '+3,820',
    returnRatePct: '+8.4%',
    topStockSymbol: 'WDG',
    topStockReturnPct: '+14.2%',
    tradeCount: 14,
    feeBurnContributionWld: '97',
    diversificationScore: 92,
    traderPersona: '철저한 분산 투자자 (Sage of Diversification)',
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `[월덕 머니버스] 주간 금융 영수증 (W${summary.weekNumber})\n총 거래량: ${summary.totalTurnoverWld} WLD\n실현 손익: ${summary.realizedGainWld} WLD (${summary.returnRatePct})\n최고 효자 종목: ${summary.topStockSymbol} (${summary.topStockReturnPct})\n투자 페르소나: ${summary.traderPersona}\nhttps://easy-scraping.com/stocks/portfolio`,
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <section aria-labelledby="weekly-receipt-heading" className="w-full max-w-lg mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-700/80 bg-gradient-to-b from-card via-card to-background p-6 shadow-xl backdrop-blur-xl space-y-5">
        {/* Receipt Header */}
        <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-border/80 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <Receipt className="size-3.5" />
            <T korean={`제 ${summary.weekNumber}주차 주간 금융 영수증`} english={`Week ${summary.weekNumber} Financial Digest`} />
          </div>
          <h2 id="weekly-receipt-heading" className="text-xl font-extrabold text-foreground tracking-tight">
            WOLDEOK MONEYVERSE
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {summary.periodLabel}
          </p>

          {/* Persona Badge */}
          <div className="pt-2">
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs font-bold px-3 py-1">
              <Sparkles className="size-3.5 mr-1" />
              {summary.traderPersona}
            </Badge>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              <T korean="주간 실현 손익 (Net Profit)" english="Weekly Realized Profit" />
            </span>
            <span className="font-mono font-extrabold text-lg tabular-nums text-emerald-400">
              {summary.realizedGainWld} WLD ({summary.returnRatePct})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              <T korean="주간 총 거래대금" english="Total Turnover" />
            </span>
            <span className="font-mono font-bold text-sm tabular-nums text-foreground">
              {summary.totalTurnoverWld} WLD
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              <T korean="최고 수익 효자 종목" english="Top Performing Stock" />
            </span>
            <span className="font-mono font-bold text-sm tabular-nums text-emerald-400">
              {summary.topStockSymbol} ({summary.topStockReturnPct})
            </span>
          </div>
        </div>

        {/* Itemized Receipt Breakdown */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-border/40 text-muted-foreground">
            <span><T korean="체결 횟수 (Trades)" english="Executed Trades" /></span>
            <span className="font-mono font-bold text-foreground">{summary.tradeCount}회</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/40 text-muted-foreground">
            <span><T korean="재화 소각 기여액 (Burned Fees)" english="Fee Burn Contribution" /></span>
            <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
              <Flame className="size-3" /> {summary.feeBurnContributionWld} WLD
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/40 text-muted-foreground">
            <span><T korean="섹터 분산 건전성 점수" english="Diversification Score" /></span>
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="size-3.5" /> {summary.diversificationScore}점 (A등급)
            </span>
          </div>
        </div>

        {/* Barcode & Signature Graphic */}
        <div className="pt-2 text-center space-y-2">
          <div className="h-9 w-full bg-gradient-to-r from-transparent via-border to-transparent rounded flex items-center justify-center">
            <div className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground/60 select-none">
              ||| | |||| | ||| ||||| |||| || |||
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            <T
              korean="본 영수증은 가상 금융 원장(PostgreSQL)에 안전하게 기록된 공인 결산서입니다."
              english="Certified ledger digest backed by Woldeok Moneyverse state engine."
            />
          </p>
        </div>

        {/* Share Action */}
        <Button
          onClick={handleShare}
          className="w-full h-11 rounded-2xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isCopied ? (
            <>
              <CheckCircle2 className="size-4 text-emerald-300" />
              <span><T korean="영수증 클립보드 복사 완료!" english="Receipt Copied to Clipboard!" /></span>
            </>
          ) : (
            <>
              <Share2 className="size-4" />
              <span><T korean="주간 금융 영수증 복사 및 공유하기" english="Share Weekly Receipt" /></span>
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
