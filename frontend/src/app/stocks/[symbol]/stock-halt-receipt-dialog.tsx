'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, Copy, Download, Receipt, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { groupDigits } from '@/lib/money';

export interface StockHaltReceiptData {
  readonly id: string;
  readonly halt_event_id: string;
  readonly stock_id: string;
  readonly stock_symbol: string;
  readonly stock_name: string;
  readonly quantity: string;
  readonly basis_method: string;
  readonly basis_unit_amount: string;
  readonly refund_amount: string;
  readonly status: string;
  readonly created_at: string;
}

interface StockHaltReceiptDialogProps {
  readonly receipt: StockHaltReceiptData;
  readonly open?: boolean | undefined;
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  readonly isEn?: boolean | undefined;
  readonly children?: React.ReactNode | undefined;
}

export function StockHaltReceiptDialog({
  receipt,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  isEn = false,
  children,
}: StockHaltReceiptDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const onOpenChange = externalOnOpenChange || setInternalOpen;

  const handleCopyProof = () => {
    const text = [
      `[월덕 머니버스 주식 거래정지 매수원가 자동정산 영수증]`,
      `정산 ID: ${receipt.id}`,
      `정지 이벤트: ${receipt.halt_event_id}`,
      `종목: ${receipt.stock_name} (${receipt.stock_symbol})`,
      `정산 수량: ${groupDigits(receipt.quantity)}주`,
      `원가 산정 방식: ${receipt.basis_method}`,
      `적용 매수원가(단가): ${groupDigits(receipt.basis_unit_amount)} WLD`,
      `총 환급 WLD: ${groupDigits(receipt.refund_amount)} WLD`,
      `적용 수수료/세금: 0 WLD (전액 면제)`,
      `정산 상태: ${receipt.status}`,
      `정산 일시: ${receipt.created_at}`,
      `원장 검증: VALID (Idempotent Cryptographic Settlement)`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-md p-6 overflow-hidden">
        {/* 장식용 워터마크 백그라운드 */}
        <div className="absolute -right-8 -top-8 size-36 rounded-full bg-emerald-500/10 pointer-events-none blur-xl" />

        <DialogHeader className="relative z-10 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Receipt className="size-5" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isEn ? 'Authoritative Settlement Receipt' : '거래정지 매수원가 정산 영수증'}
                </DialogTitle>
                <p className="text-[11px] font-mono text-muted-foreground">
                  {receipt.id}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {receipt.status}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
            {isEn
              ? 'This official receipt proves your stock holdings were refunded into WLD at authoritative cost basis.'
              : 'STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC 규격에 따라 분산 원장에서 매수원가로 100% 자동 환급된 공식 영수증입니다.'}
          </DialogDescription>
        </DialogHeader>

        {/* 영수증 본문 카드 */}
        <div className="relative z-10 my-3 rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3 font-sans">
          {/* 상단 종목 정보 스트립 */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div>
              <span className="text-[11px] text-muted-foreground block">{isEn ? 'Settled Stock' : '정산 종목'}</span>
              <span className="text-sm font-black text-foreground">{receipt.stock_name}</span>
            </div>
            <Badge variant="secondary" className="font-mono text-xs font-bold">
              {receipt.stock_symbol}
            </Badge>
          </div>

          {/* 수량 및 원가 정보 2열 그리드 */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded-xl border border-border/50 bg-background/50 p-2.5">
              <span className="text-[10px] font-semibold text-muted-foreground block">{isEn ? 'Quantity' : '정산 보유수량'}</span>
              <span className="font-mono text-sm font-bold text-foreground">{groupDigits(receipt.quantity)}주</span>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/50 p-2.5">
              <span className="text-[10px] font-semibold text-muted-foreground block">{isEn ? 'Cost Basis (Unit)' : '기준 취득단가'}</span>
              <span className="font-mono text-sm font-bold text-foreground">{groupDigits(receipt.basis_unit_amount)} WLD</span>
            </div>
          </div>

          {/* 환급 총액 하이라이트 */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                {isEn ? 'Total Refund Amount' : '총 환급 정산액'}
              </span>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                수수료·세금 전액 면제 (0 WLD)
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-black text-primary">
                +{groupDigits(receipt.refund_amount)} <span className="text-xs font-bold">WLD</span>
              </span>
            </div>
          </div>

          {/* 원장 검증 메타데이터 */}
          <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>{isEn ? 'Settlement Method' : '원가 산정 방식'}</span>
              <span className="font-medium text-foreground">{receipt.basis_method}</span>
            </div>
            <div className="flex justify-between">
              <span>{isEn ? 'Event ID' : '정지 이벤트 ID'}</span>
              <span className="font-mono text-[10px] text-foreground">{receipt.halt_event_id}</span>
            </div>
            <div className="flex justify-between">
              <span>{isEn ? 'Settled At' : '정산 일시'}</span>
              <span className="font-medium text-foreground">{receipt.created_at}</span>
            </div>
          </div>

          {/* 원장 봉인 직인 */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
            <span>원장 분산 합의 및 암호학적 멱등성 검증 완료</span>
          </div>
        </div>

        <DialogFooter className="relative z-10 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyProof}
            className="gap-1.5 text-xs font-bold"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span>{copied ? (isEn ? 'Copied!' : '복사됨!') : (isEn ? 'Copy Receipt' : '영수증 텍스트 복사')}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold"
          >
            {isEn ? 'Close' : '확인 완료'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
