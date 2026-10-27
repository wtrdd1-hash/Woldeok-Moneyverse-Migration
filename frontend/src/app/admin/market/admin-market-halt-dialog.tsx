'use client';

import { useState, useEffect } from 'react';
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
import { groupDigits } from '@/lib/money';
import type { AdminStock, AdminStockHaltSettlement } from '../types';

export function HaltStockDialog({ stock }: { readonly stock: AdminStock }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" title="거래정지 정산 안전 보류 사유 확인">
          거래정지 (Halt)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{stock.symbol} 거래정지 정산 안전 보류</DialogTitle>
          <DialogDescription>
            원장 환급과 국고 차감이 단일 원자적 거래 및 멱등 영수증으로 검증되기 전까지
            거래정지와 자동정산을 실행할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <p role="alert" className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
          금융 원장 보호를 위해 신규 정산 및 재처리를 중지했습니다. 기존 정산 현황은 읽기 전용으로 확인할 수 있습니다.
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HaltSettlementStatusDialog({ stock }: { readonly stock: AdminStock }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<AdminStockHaltSettlement | null>(null);
  const [loading, setLoading] = useState(false);

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
  }, [open, stock.id]);

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

              <p role="note" className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-xs">
                위 숫자는 기존 원장 정산 기록입니다. 별도의 국고 차감 및 재처리 멱등 영수증은 검증되지 않았으며
                전체 금융 정산 완료를 의미하지 않습니다.
              </p>
              {Number(data.quarantined_count) > 0 || Number(data.pending_holdings_count) > 0 ? (
                <p role="alert" className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-xs">
                  미정산 또는 격리 항목이 남아 있습니다. 원장·국고 정산의 원자성과 멱등성이 검증되기 전까지 재처리는 차단됩니다.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              정산 현황을 확인할 수 없습니다. 실제 영수증과 원장 증빙을 확인하기 전에는 완료로 간주하지 마세요.
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
