'use client';

import React, { useState } from 'react';
import { AlertTriangle, FileText, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  StockHaltReceiptDialog,
  type StockHaltReceiptData,
} from './stock-halt-receipt-dialog';

interface StockHaltBannerProps {
  readonly symbol: string;
  readonly name: string;
  readonly haltStatus?: string | null | undefined;
  readonly receipt?: StockHaltReceiptData | null | undefined;
  readonly isEn?: boolean | undefined;
}

export function StockHaltBanner({
  symbol,
  name,
  haltStatus,
  receipt,
  isEn = false,
}: StockHaltBannerProps) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent p-4 sm:p-5 text-rose-900 dark:text-rose-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 mt-0.5">
              <ShieldAlert className="size-5" />
            </span>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base tracking-tight text-rose-950 dark:text-rose-100">
                  {isEn ? `${symbol} Trading Halted · Cost-Basis Settlement Active` : `${symbol} 종목 거래정지 · 매수원가 자동정산 안내`}
                </h4>
                <Badge variant="outline" className="border-rose-500/50 bg-rose-500/10 text-[11px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {haltStatus ?? 'HALTED'}
                </Badge>
              </div>
              <p className="text-xs text-rose-900/90 dark:text-rose-200/90 leading-relaxed [word-break:keep-all] max-w-3xl">
                {isEn
                  ? `Trading for ${name} (${symbol}) is officially halted by market policy (STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC). All user holdings are atomically converted into WLD at authoritative cost basis with zero slippage, fees, or taxes. New buy/sell orders are strictly rejected.`
                  : `${name}(${symbol}) 종목은 거래소 정책(STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC)에 따라 공식 거래정지되었습니다. 기획 명세에 따라 모든 사용자 보유 주식은 시장가가 아닌 서버 권위 매수원가(Cost Basis)로 100% WLD 자동 환급되었으며 거래세와 수수료는 전액 면제되었습니다.`}
              </p>
            </div>
          </div>

          {receipt && (
            <div className="shrink-0 self-end sm:self-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReceiptOpen(true)}
                className="h-10 px-4 rounded-xl border-rose-500/40 bg-background/80 hover:bg-rose-500/15 text-rose-900 dark:text-rose-100 font-bold text-xs gap-1.5 shadow-xs"
              >
                <FileText className="size-4 text-rose-500" />
                <span>{isEn ? 'View Refund Receipt' : '원가 환급 영수증 조회'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {receipt && (
        <StockHaltReceiptDialog
          receipt={receipt}
          open={isReceiptOpen}
          onOpenChange={setIsReceiptOpen}
          isEn={isEn}
        />
      )}
    </>
  );
}
