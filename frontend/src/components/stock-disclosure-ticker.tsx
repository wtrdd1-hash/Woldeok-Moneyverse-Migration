'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { CORPORATE_DISCLOSURES, type CorporateDisclosure } from '@/config/stock-disclosures.config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { TranslatedText as T } from '@/components/translated-text';

export function StockDisclosureTicker() {
  const [selectedDisclosure, setSelectedDisclosure] = useState<CorporateDisclosure | null>(null);

  return (
    <>
      <section aria-labelledby="stock-disclosure-heading" className="w-full">
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-4 sm:p-5 shadow-sm backdrop-blur-md">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
                <Megaphone className="size-4" />
              </div>
              <h2 id="stock-disclosure-heading" className="text-sm font-bold text-foreground flex items-center gap-2">
                <T korean="WDX 가상 기업 공시 자료" english="WDX Virtual Corporate Disclosures" />
                <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] font-bold">
                  <T korean="가상 공시 자료" english="SIMULATED" />
                </Badge>
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              <T korean="게임 내 가상 공시 예시입니다. 표시된 변동률은 실제 거래 결과를 보장하지 않습니다." english="Simulated game disclosures; displayed movements are not guaranteed outcomes." />
            </span>
          </div>

          {/* Disclosure List Grid */}
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {CORPORATE_DISCLOSURES.slice(0, 6).map((disc) => {
              const isUp = disc.impactDirection === 'up';
              return (
                <button
                  key={disc.id}
                  type="button"
                  onClick={() => setSelectedDisclosure(disc)}
                  className="group relative flex flex-col justify-between text-left p-3 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/70 hover:border-amber-500/40 transition-all active:scale-[0.99] min-h-[100px]"
                >
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="font-mono text-[10px] font-bold px-1.5 py-0">
                          {disc.symbol}
                        </Badge>
                        <span className="text-xs font-bold text-foreground truncate max-w-[110px]">
                          {disc.companyName}
                        </span>
                      </div>
                      <Badge
                        className={`text-[10px] font-bold flex items-center gap-1 px-1.5 py-0 ${
                          isUp
                            ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                        }`}
                      >
                        {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        <span>{disc.expectedImpactPct}</span>
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors">
                      {disc.title}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3" /> {disc.sector} · {disc.disclosureType}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <T korean="공시 전문" english="Read" /> <ChevronRight className="size-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal Dialog for Full Disclosure */}
      <Dialog open={selectedDisclosure !== null} onOpenChange={(open) => !open && setSelectedDisclosure(null)}>
        {selectedDisclosure && (
          <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-lg flex-col gap-3 overflow-hidden rounded-2xl border-border bg-card p-4 shadow-2xl sm:p-6 [&_[data-slot=dialog-close]]:size-11 [&_[data-slot=dialog-close]]:grid [&_[data-slot=dialog-close]]:place-items-center">
            <DialogHeader className="shrink-0 space-y-2 pr-10 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold px-2 py-0.5">
                  {selectedDisclosure.symbol}
                </Badge>
                <span className="text-sm font-bold text-foreground">
                  {selectedDisclosure.companyName}
                </span>
                <Badge
                  className={`text-xs font-bold ml-auto ${
                    selectedDisclosure.impactDirection === 'up'
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                  }`}
                >
                  {selectedDisclosure.impactDirection === 'up' ? '▲ 호재 공시' : '▼ 악재 공시'} ({selectedDisclosure.expectedImpactPct})
                </Badge>
              </div>

              <DialogTitle className="text-base sm:text-lg font-extrabold text-foreground leading-snug">
                {selectedDisclosure.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                <Calendar className="size-3" />
                <span>{new Date(selectedDisclosure.publishedAt).toLocaleString('ko-KR')}</span>
                <span>·</span>
                <Building2 className="size-3" />
                <span>{selectedDisclosure.sector} 섹터 ({selectedDisclosure.disclosureType})</span>
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-1 py-2 text-xs leading-relaxed text-foreground/90 sm:text-sm">
              <div className="p-3 rounded-xl bg-muted/60 border border-border/70 text-xs text-foreground font-medium">
                <p className="font-bold text-amber-500 mb-1">
                  <T korean="공시 요약" english="Summary" />
                </p>
                <p>{selectedDisclosure.summary}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/60 text-xs leading-relaxed space-y-2">
                <p className="font-bold text-foreground">
                  <T korean="공시 상세 본문" english="Official Disclosure Detail" />
                </p>
                <p className="text-muted-foreground whitespace-pre-line">{selectedDisclosure.detailedBody}</p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <T
                  korean="게임 내 가상 공시 자료이며, 실제 기업의 발표나 실시간 검증된 투자 정보가 아닙니다."
                  english="This is an in-game fictional disclosure, not a real company announcement or verified live investment information."
                />
              </div>
            </div>

            <DialogFooter className="flex shrink-0 flex-col gap-2 border-t border-border/50 pt-3 pb-[env(safe-area-inset-bottom)] sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDisclosure(null)}
                className="min-h-11 w-full rounded-xl px-4 text-xs font-semibold sm:w-auto"
              >
                <T korean="닫기" english="Close" />
              </Button>
              <Button
                size="sm"
                asChild
                className="min-h-11 w-full rounded-xl bg-amber-500 px-4 text-xs font-bold text-black hover:bg-amber-600 sm:w-auto"
              >
                <a href={`/stocks/${encodeURIComponent(selectedDisclosure.symbol)}`}>
                  <T korean="해당 종목 호가 매매하기" english="Trade Orderbook" />
                  <ExternalLink className="ml-1 size-3.5" />
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
