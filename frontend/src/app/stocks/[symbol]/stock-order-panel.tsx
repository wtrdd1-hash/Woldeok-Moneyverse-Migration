'use client';

import React, { useState, useActionState, useEffect } from 'react';
import {


  ShieldCheck,
  Sparkles,
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
  readonly availableShares?: string | undefined;
  readonly holdingQuantity?: string | undefined;
  readonly isHalted?: boolean | undefined;
  readonly isEn?: boolean | undefined;
  readonly selectedPrice?: string | undefined;
  readonly activeSide?: 'buy' | 'sell' | undefined;
  readonly onSideChange?: ((side: 'buy' | 'sell') => void) | undefined;
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
  selectedPrice,
  activeSide,
  onSideChange,
}: StockOrderPanelProps) {
  const [internalSide, setInternalSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [quantity, setQuantity] = useState<string>('1');
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState(placeOrder, IDLE);

  const side = activeSide ?? internalSide;

  const handleSideChange = (newSide: 'buy' | 'sell') => {
    setInternalSide(newSide);
    onSideChange?.(newSide);
    setQuantity(newSide === 'buy' ? '1' : (Number.parseInt(holdingQuantity?.replaceAll(',', '') || '0', 10) > 0 ? '1' : '0'));
  };

  // 외부(호가창)에서 가격 선택 시 지정가 모드로 자동 설정하고 단가 반영
  useEffect(() => {
    if (selectedPrice) {
      setLimitPrice(selectedPrice);
      setOrderType('limit');
    }
  }, [selectedPrice]);

  const currentPriceNum = Number.parseInt(currentPrice.replaceAll(',', '') || '1000', 10);
  const effectivePriceNum = orderType === 'limit'
    ? Number.parseInt(limitPrice.replaceAll(',', '') || currentPrice.replaceAll(',', '') || '1000', 10)
    : currentPriceNum;
  const qtyNum = Number.parseInt(quantity.replaceAll(',', '') || '1', 10);
  const totalAmount = Math.max(0, effectivePriceNum * qtyNum);

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
              onClick={() => handleSideChange('buy')}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all min-h-[36px] ${
                side === 'buy'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isEn ? 'Buy' : '매수'}
            </button>
            <button
              type="button"
              onClick={() => handleSideChange('sell')}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all min-h-[36px] ${
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
        {/* 시장가 / 지정가 탭 */}
        <div className="flex items-center gap-2 pt-1 border-b border-border/40 pb-2.5">
          <span className="text-xs text-muted-foreground font-medium">{isEn ? 'Type:' : '주문 유형:'}</span>
          <div className="inline-flex rounded-lg border border-border/70 bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setOrderType('limit')}
              className={`rounded px-3 py-1 font-semibold transition-all ${
                orderType === 'limit'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isEn ? 'Limit (Orderbook)' : '지정가 (호가 선택)'}
            </button>
            <button
              type="button"
              onClick={() => setOrderType('market')}
              className={`rounded px-3 py-1 font-semibold transition-all ${
                orderType === 'market'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isEn ? 'Market (Instant)' : '시장가 (즉시 체결)'}
            </button>
          </div>
        </div>

        {/* 지정가 단가 필드 (호가창 클릭 시 실시간 동기화) */}
        {orderType === 'limit' ? (
          <div className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border/60">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="limit-price" className="font-bold text-foreground flex items-center gap-1">
                <span>{isEn ? 'Target Price (Per Share)' : '주문 희망 단가 (1주당)'}</span>
                <Sparkles className="size-3 text-primary animate-pulse" />
              </label>
              <button
                type="button"
                onClick={() => setLimitPrice(currentPrice)}
                className="text-[11px] text-primary hover:underline font-mono"
              >
                {isEn ? 'Reset to Current' : '현재가로 맞춤'}
              </button>
            </div>
            <div className="relative">
              <input
                id="limit-price"
                type="number"
                min={1}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                disabled={isHalted}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 font-mono text-sm font-bold pr-12 shadow-xs focus:ring-1 focus:ring-ring"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">
                WLD
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-0.5">
              {isEn
                ? 'Tip: Click any price row on the left orderbook to instantly bind.'
                : '💡 좌측 호가창의 원하는 가격을 클릭하면 단가가 자동 바인딩됩니다.'}
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-muted/30 border text-xs text-muted-foreground flex items-center justify-between">
            <span>{isEn ? 'Execution Price:' : '체결 기준:'}</span>
            <span className="font-bold font-mono text-foreground">
              {groupDigits(currentPrice)} WLD ({isEn ? 'Best Available' : '최우선 체결가'})
            </span>
          </div>
        )}

        {/* 주문 가능 수량 안내 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
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
              className="w-full h-2.5 rounded-lg bg-muted accent-primary cursor-pointer"
              aria-label="주문 수량 슬라이더"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>1주</span>
              <span>{groupDigits(Math.round(maxLimit / 2).toString())}주</span>
              <span>{groupDigits(maxLimit.toString())}주 (MAX)</span>
            </div>
          </div>

          {/* 잔액/수량 비례 퀵 프리셋 버튼 (터치 타깃 44px 준수) */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[10, 25, 50, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercent(pct)}
                disabled={isHalted || maxLimit <= 0}
                className="h-9 px-2 text-xs font-semibold rounded-lg border border-border bg-muted/40 hover:bg-muted active:scale-95 text-foreground transition-all"
              >
                {pct === 100 ? '최대' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* 예상 결제 금액 및 세금 안내 카드 */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{isEn ? 'Unit Price' : '적용 단가'}</span>
            <span className="font-mono font-bold text-foreground">
              {groupDigits(effectivePriceNum.toString())} WLD
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{isEn ? 'Est. Tax & Fee (0%)' : '거래세 및 수수료'}</span>
            <span className="font-mono text-muted-foreground">0 WLD (면제)</span>
          </div>
          <div className="border-t border-border/40 pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">{isEn ? 'Total Value' : '총 주문 금액'}</span>
            <span className="font-mono text-base font-extrabold text-primary">
              {groupDigits(totalAmount.toString())} <span className="text-xs font-normal text-muted-foreground">WLD</span>
            </span>
          </div>
        </div>

        {/* 주문 결과 알림 */}
        <ActionAlert state={state} />

        {/* 주문 실행 버튼 (최소 44px 모바일 터치 타깃) */}
        <Button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isHalted || (side === 'sell' && maxSellShares <= 0) || qtyNum <= 0 || pending}
          variant={side === 'buy' ? 'default' : 'destructive'}
          className="w-full h-12 rounded-xl text-sm font-bold shadow-md transition-transform active:scale-[0.99]"
        >
          {isHalted
            ? isEn ? 'Trading Halted' : '거래정지 종목'
            : side === 'buy'
              ? isEn ? `Buy ${groupDigits(quantity)} Shares` : `${groupDigits(quantity)}주 매수하기`
              : isEn ? `Sell ${groupDigits(quantity)} Shares` : `${groupDigits(quantity)}주 매도하기`}
        </Button>

        {/* 최종 체결 확인 다이얼로그 */}
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <span>{symbol} {side === 'buy' ? '매수 주문 확인' : '매도 주문 확인'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                가상 주식 시장 규칙에 따라 체결 트랜잭션이 원자적으로 수행됩니다.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border p-4 space-y-2.5 bg-muted/10 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">종목명:</span>
                <span className="font-bold text-foreground">{name} ({symbol})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문 유형:</span>
                <span className="font-semibold text-foreground">{orderType === 'limit' ? '지정가 주문' : '시장가 주문'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문 수량:</span>
                <span className="font-mono font-bold text-primary">{groupDigits(quantity)}주</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">적용 단가:</span>
                <span className="font-mono font-bold text-foreground">{groupDigits(effectivePriceNum.toString())} WLD</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-sm">
                <span>총 주문 금액:</span>
                <span className="font-mono text-primary">{groupDigits(totalAmount.toString())} WLD</span>
              </div>
            </div>

            <form action={formAction} className="space-y-4 pt-1">
              <input type="hidden" name="stockId" value={stockId} />
              <input type="hidden" name="side" value={side} />
              <input type="hidden" name="quantity" value={quantity} />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={pending}
                >
                  취소
                </Button>
                <SubmitButton
                  variant={side === 'buy' ? 'default' : 'destructive'}
                  size="sm"
                >
                  {side === 'buy'
                    ? (isEn ? 'Confirm Buy Order' : '매수 주문 확정')
                    : (isEn ? 'Confirm Sell Order' : '매도 주문 확정')}
                </SubmitButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
