'use client';

import { useState } from 'react';
import { CheckCircle2, Copy, Download, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TranslatedText as T } from '@/components/translated-text';

/** All amounts come from the authenticated stock portfolio read path. No trade history is inferred. */
export interface PortfolioValuationSnapshotData {
  readonly asOfLabel: string;
  readonly marketValueWld: string;
  readonly unrealizedGainWld: string;
  readonly unrealizedReturnPct: string;
  readonly largestHoldingSymbol: string;
  readonly largestHoldingReturnPct: string;
  readonly holdingCount: number;
}

function snapshotLines(data: PortfolioValuationSnapshotData): string[] {
  return [
    '월덕 머니버스 — 보유 평가 스냅샷 (거래 영수증 아님)',
    `조회 기준: ${data.asOfLabel}`,
    `현재 보유 평가액: ${data.marketValueWld} WLD`,
    `미실현 평가손익: ${data.unrealizedGainWld} WLD (${data.unrealizedReturnPct})`,
    `평가액 최대 보유 종목: ${data.largestHoldingSymbol} (${data.largestHoldingReturnPct})`,
    `보유 종목 수: ${data.holdingCount}`,
    '이 자료는 현재 보유 포지션의 평가치이며 체결·세금·소각 영수증이 아닙니다.',
  ];
}

export function PortfolioValuationSnapshot({ data }: { readonly data: PortfolioValuationSnapshotData }) {
  const [feedback, setFeedback] = useState<'idle' | 'copied' | 'error'>('idle');
  const [exporting, setExporting] = useState(false);

  async function copySnapshot() {
    try {
      await navigator.clipboard.writeText(snapshotLines(data).join('\n'));
      setFeedback('copied');
    } catch {
      setFeedback('error');
    }
  }

  function savePng() {
    setExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas unavailable');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 29px sans-serif';
      ctx.fillText('WOLDEOK MONEYVERSE', 55, 70);
      ctx.font = '22px sans-serif';
      snapshotLines(data).forEach((line, index) => ctx.fillText(line, 55, 130 + index * 65, 850));
      const anchor = document.createElement('a');
      anchor.href = canvas.toDataURL('image/png');
      anchor.download = 'moneyverse-portfolio-valuation-snapshot.png';
      anchor.click();
      setFeedback('idle');
    } catch {
      setFeedback('error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <section aria-labelledby="portfolio-snapshot-heading" className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <PieChart aria-hidden="true" className="mt-1 size-6 shrink-0 text-primary" />
        <div className="min-w-0 space-y-1">
          <h2 id="portfolio-snapshot-heading" className="text-lg font-bold text-foreground">
            <T korean="보유 평가 스냅샷" english="Holdings Valuation Snapshot" />
          </h2>
          <p className="break-words text-xs text-muted-foreground">{data.asOfLabel}</p>
        </div>
      </div>
      <dl className="space-y-3 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border pb-2">
          <dt className="text-muted-foreground"><T korean="현재 보유 평가액" english="Current holdings value" /></dt>
          <dd className="font-mono font-semibold tabular-nums">{data.marketValueWld} WLD</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border pb-2">
          <dt className="text-muted-foreground"><T korean="미실현 평가손익" english="Unrealized gain/loss" /></dt>
          <dd className="font-mono font-semibold tabular-nums">{data.unrealizedGainWld} WLD ({data.unrealizedReturnPct})</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border pb-2">
          <dt className="text-muted-foreground"><T korean="평가액 최대 보유 종목" english="Largest holding by value" /></dt>
          <dd className="font-mono font-semibold">{data.largestHoldingSymbol} ({data.largestHoldingReturnPct})</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <dt className="text-muted-foreground"><T korean="보유 종목 수" english="Number of holdings" /></dt>
          <dd className="font-mono font-semibold tabular-nums">{data.holdingCount}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        <T korean="현재 보유 포지션의 평가치입니다. 체결·세금·소각 영수증이 아닙니다. 가격 변동으로 평가액이 달라질 수 있습니다."
          english="Current position valuation only; not a trade, tax, or burn receipt. Values may change with market prices." />
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" className="min-h-11" onClick={savePng} disabled={exporting}>
          <Download aria-hidden="true" className="size-4" /> <T korean="PNG 저장" english="Save PNG" />
        </Button>
        <Button type="button" className="min-h-11" onClick={copySnapshot}>
          {feedback === 'copied' ? <CheckCircle2 aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          <T korean="요약 복사" english="Copy summary" />
        </Button>
      </div>
      <p role="status" aria-live="polite" className="mt-2 text-xs text-muted-foreground">
        {feedback === 'copied' ? '요약을 복사했습니다.' : feedback === 'error' ? '내보내기에 실패했습니다. 다시 시도해 주세요.' : ''}
      </p>
    </section>
  );
}
