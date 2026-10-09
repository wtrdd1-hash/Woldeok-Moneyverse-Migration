'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Sparkles,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Download,
  Copy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleCopyText = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `[월덕 머니버스] 주간 금융 영수증 (W${summary.weekNumber})\n기간: ${summary.periodLabel}\n총 거래량: ${summary.totalTurnoverWld} WLD\n실현 손익: ${summary.realizedGainWld} WLD (${summary.returnRatePct})\n최고 효자 종목: ${summary.topStockSymbol} (${summary.topStockReturnPct})\n체결 횟수: ${summary.tradeCount}회\n재화 소각: ${summary.feeBurnContributionWld} WLD\n투자 페르소나: ${summary.traderPersona}\nhttps://easy-scraping.com/stocks/portfolio`,
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadImage = () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 960;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 960);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#05070d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 960);

      // Card Border & Glow
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 740, 900);

      // Header Tag
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`제 ${summary.weekNumber}주차 주간 금융 영수증`, 400, 80);

      // Main Brand Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px sans-serif';
      ctx.fillText('WOLDEOK MONEYVERSE', 400, 130);

      // Period
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px monospace';
      ctx.fillText(summary.periodLabel, 400, 165);

      // Persona Badge Box
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.roundRect(150, 190, 500, 44, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`✨ ${summary.traderPersona}`, 400, 218);

      // Dashed Separator
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(60, 260);
      ctx.lineTo(740, 260);
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlight Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.roundRect(60, 280, 680, 200, 16);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      // Net Profit
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.fillText('주간 실현 손익 (Net Profit)', 90, 325);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#34d399';
      ctx.font = '900 28px monospace';
      ctx.fillText(`${summary.realizedGainWld} WLD (${summary.returnRatePct})`, 710, 325);

      // Turnover
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.fillText('주간 총 거래대금', 90, 380);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`${summary.totalTurnoverWld} WLD`, 710, 380);

      // Top Stock
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.fillText('최고 수익 효자 종목', 90, 435);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`${summary.topStockSymbol} (${summary.topStockReturnPct})`, 710, 435);

      // Detailed Metrics Rows
      const rows = [
        { label: '체결 횟수 (Executed Trades)', val: `${summary.tradeCount}회`, color: '#f8fafc' },
        { label: '재화 소각 기여액 (Burned Fees)', val: `🔥 ${summary.feeBurnContributionWld} WLD`, color: '#fbbf24' },
        { label: '섹터 분산 건전성 점수', val: `🛡️ ${summary.diversificationScore}점 (A등급)`, color: '#34d399' },
      ];

      let startY = 525;
      rows.forEach((r) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px sans-serif';
        ctx.fillText(r.label, 90, startY);

        ctx.textAlign = 'right';
        ctx.fillStyle = r.color;
        ctx.font = 'bold 20px monospace';
        ctx.fillText(r.val, 710, startY);

        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(90, startY + 15);
        ctx.lineTo(710, startY + 15);
        ctx.stroke();

        startY += 60;
      });

      // Barcode Graphic
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.font = '16px monospace';
      ctx.fillText('||| | |||| | ||| ||||| |||| || ||| |||| | |||', 400, 750);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('본 영수증은 가상 주식 포트폴리오 활동을 요약한 시뮬레이션 결산 리포트입니다.', 400, 785);
      ctx.font = '13px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('https://easy-scraping.com/stocks/portfolio', 400, 815);

      // Download trigger
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `moneyverse-receipt-w${summary.weekNumber}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsGenerating(false);
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
              korean="본 영수증은 가상 주식 포트폴리오 활동을 요약한 시뮬레이션 결산 리포트입니다."
              english="Simulated portfolio performance digest for Woldeok Moneyverse."
            />
          </p>
        </div>

        {/* Dual Actions: Download PNG & Copy Text */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            variant="outline"
            className="w-full h-11 rounded-2xl font-bold text-xs border-primary/40 hover:bg-primary/10 active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <Download className="size-4 text-primary" />
            <span><T korean="PNG 이미지 저장" english="Download PNG" /></span>
          </Button>

          <Button
            onClick={handleCopyText}
            className="w-full h-11 rounded-2xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            {isCopied ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-300" />
                <span><T korean="복사 완료!" english="Copied!" /></span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span><T korean="요약본 복사" english="Copy Text" /></span>
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
