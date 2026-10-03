'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, CheckCircle2, Award, PieChart, ArrowRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  diagnosePortfolioDiversification,
  type PortfolioDiagnosticResult,
} from '@/lib/portfolio-diagnostics';
import type { PortfolioHoldingInput } from '@/app/stocks/portfolio/analysis';
import { formatWld } from '@/lib/money';
import { TranslatedText as T } from '@/components/translated-text';

export function SectorDiversificationCard({
  holdings,
}: {
  readonly holdings: readonly PortfolioHoldingInput[];
}) {
  const result: PortfolioDiagnosticResult = diagnosePortfolioDiversification(holdings);

  const getGradeBadgeClass = (grade: 'A' | 'B' | 'C') => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'B':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'C':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <section aria-labelledby="portfolio-diversification-heading" className="w-full">
      <div className="rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 shadow-sm backdrop-blur-md space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <PieChart className="size-5" />
            </div>
            <div>
              <h2 id="portfolio-diversification-heading" className="text-base font-extrabold text-foreground flex items-center gap-2">
                <T korean="3섹터 분산 투자 & 포트폴리오 건전성 진단" english="3-Sector Diversification Diagnostic" />
                <Badge className={getGradeBadgeClass(result.riskGrade)}>
                  Grade {result.riskGrade}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                <T
                  korean="WDX 시장 숙련도 규정(Section 5.7)에 따른 자산 집중도(HHI) 및 섹터 분산 평가입니다."
                  english="Portfolio concentration and sector allocation under WDX market mastery guidelines."
                />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {result.isThreeSectorDiversified ? (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-bold px-2.5 py-1 flex items-center gap-1.5">
                <Award className="size-3.5" />
                <T korean="3섹터 분산 달성 (+150 XP)" english="3-Sector Mastery (+150 XP)" />
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-xs font-medium px-2.5 py-1">
                <T
                  korean={`${result.distinctSectorCount}/3 섹터 분산 중`}
                  english={`${result.distinctSectorCount}/3 Sectors Active`}
                />
              </Badge>
            )}
          </div>
        </div>

        {/* Diagnosis Status Box */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Left Summary */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">{result.gradeTitle}</span>
              <span className="font-mono text-xs text-muted-foreground">
                HHI: <b className="text-foreground">{result.hhiScore.toLocaleString()}</b> / 10,000
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.gradeDescription}
            </p>
            <div className="pt-2 border-t border-border/40 text-[11px] font-medium text-amber-500 flex items-start gap-1.5">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
              <span>{result.recommendationMessage}</span>
            </div>
          </div>

          {/* Right Metrics Grid */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex flex-col justify-between space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-card border border-border/50">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  <T korean="보유 섹터 수" english="Sectors" />
                </span>
                <span className="font-mono text-base font-extrabold text-foreground tabular-nums">
                  {result.distinctSectorCount}개
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/50">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  <T korean="최대 집중 섹터" english="Top Sector" />
                </span>
                <span className="text-xs font-extrabold text-foreground truncate block">
                  {result.topConcentratedSector ?? '없음'}
                </span>
              </div>
            </div>

            <Button asChild size="sm" variant="outline" className="w-full text-xs font-bold rounded-xl h-8">
              <Link href="/stocks">
                <TrendingUp className="size-3.5 mr-1 text-emerald-400" />
                <T korean="신규 섹터 종목 발굴하기" english="Explore New Sectors" />
                <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Sector Allocation Breakdown Bars */}
        {result.sectorAllocations.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-foreground">
              <T korean="섹터별 자산 비중 상세" english="Sector Allocation Breakdown" />
            </h3>
            <div className="space-y-2">
              {result.sectorAllocations.map((sec) => {
                const pct = (sec.percentageBps / 100).toFixed(1);
                return (
                  <div key={sec.sector} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-primary" />
                        {sec.sector} 섹터 ({sec.symbols.join(', ')})
                      </span>
                      <span className="font-mono font-bold tabular-nums text-foreground">
                        {formatWld(sec.marketValue)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(2, Number(pct)))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
