'use client';

import React, { useState, useActionState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { placeOrder } from '../actions';

interface StockOrderPanelProps {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly availableShares?: string;
  readonly holdingQuantity?: string;
  readonly isHalted?: boolean;
  readonly isEn?: boolean;
}

export function StockOrderPanel({
  stockId,
  symbol,
  name,
  currentPrice,
  availableShares,
  holdingQuantity,
  isHalted = false,
  isEn = false,
}: StockOrderPanelProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('1');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState(placeOrder, IDLE);

  const priceNum = Number.parseInt(currentPrice.replaceAll(',', '') || '1000', 10);
  const qtyNum = Number.parseInt(quantity.replaceAll(',', '') || '1', 10);
  const totalAmount = Math.max(0, priceNum * qtyNum);

  const maxBuyShares = availableShares ? Number.parseInt(availableShares.replaceAll(',', ''), 10) : 1000;
  const maxSellShares = holdingQuantity ? Number.parseInt(holdingQuantity.replaceAll(',', ''), 10) : 0;
  const maxLimit = side === 'buy' ? Math.max(1, maxBuyShares) : Math.max(1, maxSellShares);

  // 체결 성공 시 확인 창 닫기 및 수량 초기화
  useEffect(() => {
    if (state.status === 'ok') {
      setIsConfirmOpen(false);
      setQuantity('1');
    }
  }, [state.status]);

  const handleQuickAdd = (add: number) => {
    const next = Math.max(1, Math.min(maxLimit, qtyNum + add));
    setQuantity(next.toString());
  };

  const handlePercent = (percent: number) => {
    const next = Math.max(1, Math.floor((maxLimit * percent) / 100));
    setQuantity(next.toString());
  };

  return (
    <Card className="border-border/80 bg-card/60 shadow-md">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <span>{symbol} {isEn ? 'Order' : '주문'}</span>
            <Badge variant="outline" className="font-mono text-xs font-normal">
              {groupDigits(currentPrice)} WLD
            </Badge>
          </CardTitle>

          {/* 매수 / 매도 전환 탭 */}
          <div className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setSide('buy');
                setQuantity('1');
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                side === 'buy'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isEn ? 'Buy' : '매수'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSide('sell');
                setQuantity(maxSellShares > 0 ? '1' : '0');
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                side === 'sell'
                  ? 'bg-destructive text-destructive-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isEn ? 'Sell' : '매도'}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2 space-y-4">
        {/* 주문 가능 수량 안내 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            {side === 'buy'
              ? isEn ? 'Market Available' : '시장 거래 가능 수량'
              : isEn ? 'My Holding Shares' : '내 보유 수량'}
          </span>
          <span className="font-mono font-bold text-foreground">
            {side === 'buy'
              ? `${groupDigits(availableShares ?? '—')}주`
              : `${groupDigits(holdingQuantity ?? '0')}주`}
          </span>
        </div>

        {/* 수량 입력 필드 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="order-quantity" className="text-xs font-bold text-foreground">
              {isEn ? 'Order Quantity' : '주문 수량'}
            </label>
            <span className="font-mono text-xs font-bold text-primary">
              {groupDigits(quantity)} {isEn ? 'shares' : '주'}
            </span>
          </div>

          <div className="relative">
            <input
              id="order-quantity"
              type="number"
              min={1}
              max={maxLimit}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isHalted || (side === 'sell' && maxSellShares <= 0)}
              className="w-full h-11 rounded-xl border border-input bg-background px-4 font-mono text-base font-bold pr-12 shadow-xs focus:ring-1 focus:ring-ring"
            />
            <span className="absolute right-3.5 top-3 text-xs font-bold text-muted-foreground">
              {isEn ? 'shares' : '주'}
            </span>
          </div>

          {/* 원터치 빠른 수량 슬라이더 (1주 ~ 최대) */}
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min={1}
              max={Math.max(1, maxLimit)}
              value={Math.min(maxLimit, isNaN(qtyNum) ? 1 : qtyNum)}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isHalted || (side === 'sell' && maxSellShares <= 0)}
              className="w-full h-2 rounded-lg bg-muted accent-primary cursor-pointer"
              aria-label="주문 수량 슬라이더"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>1주</span>
              <span>{groupDigits(Math.round(maxLimit / 2).toString())}주</span>
              <span>{groupDigits(maxLimit.toString())}주 (MAX)</span>
            </div>
          </div>

          {/* 잔액/수량 비례 퀵 프리셋 버튼 */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handlePercent(10)}
              disabled={isHalted || maxLimit <= 0}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              10%
            </button>
            <button
              type="button"
              onClick={() => handlePercent(25)}
              disabled={isHalted || maxLimit <= 0}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => handlePercent(50)}
              disabled={isHalted || maxLimit <= 0}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => handlePercent(100)}
              disabled={isHalted || maxLimit <= 0}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              MAX
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(5)}
              disabled={isHalted || maxLimit <= 0}
              className="px-2 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(10)}
              disabled={isHalted || maxLimit <= 0}
              className="px-2 py-1 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              +10
            </button>
          </div>
        </div>

        {/* 예상 결제 금액 및 수수료 요약 카드 */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{isEn ? 'Estimated Total' : '예상 결제 총액'}</span>
            <span className="font-mono text-base font-extrabold text-foreground">
              {groupDigits(totalAmount.toString())} WLD
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
            <span>{isEn ? 'Trading Fee & Tax' : '거래 수수료 및 거래세'}</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              0 WLD (0.0% 면제)
            </span>
          </div>
        </div>

        {/* 피드백 알림 */}
        <ActionAlert state={state} />

        {/* 2단계 확인 모달 트리거 버튼 */}
        <Button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isHalted || qtyNum <= 0 || (side === 'sell' && maxSellShares <= 0)}
          variant={side === 'buy' ? 'default' : 'destructive'}
          className="h-12 w-full font-bold text-sm rounded-xl shadow-md gap-2"
        >
          {isHalted ? (
            <span>거래정지 종목 (주문 차단됨)</span>
          ) : side === 'buy' ? (
            <>
              <TrendingUp className="size-4" />
              <span>{groupDigits(quantity)}주 매수하기 ({groupDigits(totalAmount.toString())} WLD)</span>
            </>
          ) : (
            <>
              <TrendingDown className="size-4" />
              <span>{groupDigits(quantity)}주 매도하기 ({groupDigits(totalAmount.toString())} WLD)</span>
            </>
          )}
        </Button>
      </CardContent>

      {/* 2단계 바텀시트 / 주문 확인 모달 */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="size-5 text-primary" />
              <span>{side === 'buy' ? '가상 주식 매수 확인' : '가상 주식 매도 확인'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              아래 주문 명세를 확인한 후 최종 체결을 승인하세요. 체결 후에는 취소할 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="space-y-4 py-2">
            <input type="hidden" name="stockId" value={stockId} />
            <input type="hidden" name="side" value={side} />
            <input type="hidden" name="quantity" value={quantity} />

            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">종목명 (티커)</span>
                <span className="font-bold text-foreground">{name} ({symbol})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">주문 유형</span>
                <Badge variant={side === 'buy' ? 'default' : 'destructive'} className="font-bold text-[11px]">
                  {side === 'buy' ? '즉시 매수' : '즉시 매도'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">주문 수량</span>
                <span className="font-mono font-bold text-foreground text-sm">{groupDigits(quantity)}주</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">체결 기준 단가</span>
                <span className="font-mono font-bold text-foreground">{groupDigits(currentPrice)} WLD</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-2 font-bold text-sm">
                <span>총 체결 예정 금액</span>
                <span className="font-mono text-primary text-base">{groupDigits(totalAmount.toString())} WLD</span>
              </div>
            </div>

            <DialogFooter className="sm:justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmOpen(false)}
                className="text-xs"
              >
                취소
              </Button>
              <SubmitButton
                variant={side === 'buy' ? 'default' : 'destructive'}
                className="font-bold text-xs px-6 h-10 rounded-xl"
              >
                {side === 'buy' ? '매수 주문 최종 승인' : '매도 주문 최종 승인'}
              </SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
