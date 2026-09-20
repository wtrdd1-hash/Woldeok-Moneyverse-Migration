'use client';

import { useActionState, useState, useEffect } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { StepUpField } from '../step-up-field';
import { haltStockAndSettle, retryHaltSettlement } from '../actions';
import type { AdminStock, AdminStockHaltSettlement } from '../types';

export function HaltStockDialog({ stock }: { readonly stock: AdminStock }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(haltStockAndSettle, IDLE);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
          title="종목 거래정지 및 매수원가 자동정산"
        >
          거래정지 (Halt)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>종목 거래정지 & 매수원가 자동정산</span>
            <Badge variant="destructive" className="font-mono text-xs">
              {stock.symbol}
            </Badge>
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-2 text-left">
            <span className="block font-medium text-foreground">
              {stock.name} ({stock.symbol}) 종목의 거래를 정지하고 보유분을 전량 정산합니다.
            </span>
            <span className="block text-xs text-muted-foreground leading-relaxed">
              기획 명세(STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC)에 따라, 모든 사용자 보유분은
              현재 시장가가 아닌 <strong>서버 권위 매수원가(Cost Basis) WLD</strong>로 즉시
              자동정산되며 매매수수료와 세금은 전액 면제됩니다.
            </span>
            <div className="mt-3 rounded-lg border border-border/70 bg-muted/30 p-2.5 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground block">현재 시장가:</span>
                <span className="font-mono font-semibold">{groupDigits(stock.current_price)} WLD</span>
              </div>
              <div>
                <span className="text-muted-foreground block">영향 보유자:</span>
                <span className="font-mono font-semibold">{stock.holders}명</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="stockId" value={stock.id} />
          <ActionAlert state={state} />
          <StepUpField
            id={`stock-halt-${stock.id}`}
            undo="정산 완료 후에는 복구할 수 없으며 보존 후 삭제만 가능합니다."
          />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <SubmitButton variant="destructive">거래정지 및 원가정산 확정</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function HaltSettlementStatusDialog({ stock }: { readonly stock: AdminStock }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<AdminStockHaltSettlement | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryState, retryAction] = useActionState(retryHaltSettlement, IDLE);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/v1/admin/stocks/${encodeURIComponent(stock.id)}/halt-settlement`)
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res) setData(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, stock.id, retryState]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="gap-1">
          <span>정산 현황</span>
          {stock.halt_status === 'HALTED_SETTLED' ? (
            <span className="size-1.5 rounded-full bg-emerald-500" />
          ) : (
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>거래정지 원가정산 현황</span>
            <Badge variant="outline" className="font-mono text-xs">
              {stock.symbol}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {stock.name} ({stock.symbol}) 종목의 자동정산 영수증 및 원장 처리 내역입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          {loading ? (
            <p className="text-center text-muted-foreground py-4 text-xs">현황 데이터를 불러오는 중...</p>
          ) : data ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/20 p-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">정지 상태:</span>
                  <Badge variant={data.halt_status === 'HALTED_SETTLED' ? 'default' : 'secondary'} className="mt-0.5 text-xs">
                    {data.halt_status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block">정산 일시:</span>
                  <span className="font-mono mt-0.5 block text-[11px]">
                    {data.halted_at ? new Date(data.halted_at).toLocaleString('ko-KR') : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">정산 완료 계정:</span>
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {groupDigits(data.settled_count)}건
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">총 환급 WLD:</span>
                  <span className="font-mono font-bold text-sm text-primary">
                    {groupDigits(data.total_refund_amount)} WLD
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">격리/오류 건수:</span>
                  <span className={Number(data.quarantined_count) > 0 ? 'font-mono font-bold text-destructive' : 'font-mono'}>
                    {data.quarantined_count}건
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">미정산 잔여 보유:</span>
                  <span className={Number(data.pending_holdings_count) > 0 ? 'font-mono font-bold text-amber-500' : 'font-mono'}>
                    {data.pending_holdings_count}건
                  </span>
                </div>
              </div>

              {Number(data.quarantined_count) > 0 || Number(data.pending_holdings_count) > 0 ? (
                <form action={retryAction} className="pt-2">
                  <input type="hidden" name="stockId" value={stock.id} />
                  <ActionAlert state={retryState} />
                  <div className="flex justify-end pt-2">
                    <SubmitButton variant="outline">실패/격리 건 멱등 재처리</SubmitButton>
                  </div>
                </form>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              정산 완료 상태이며, 상세 영수증이 원장에 안전 보관되었습니다.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
