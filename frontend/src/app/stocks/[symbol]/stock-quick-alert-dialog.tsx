'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { Bell, BellPlus, CheckCircle2 as _CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { createStockAlert } from '../alerts/actions';

interface StockQuickAlertDialogProps {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly isEn?: boolean;
}

export function StockQuickAlertDialog({
  stockId,
  symbol,
  name,
  currentPrice,
  isEn = false,
}: StockQuickAlertDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conditionKind, setConditionKind] = useState<'price_at_or_above' | 'price_at_or_below' | 'day_change_at_or_above' | 'day_change_at_or_below'>('price_at_or_above');
  const [threshold, setThreshold] = useState('');
  const [createState, createAction] = useActionState(createStockAlert, IDLE);

  // Auto-fill recommended threshold when condition changes
  useEffect(() => {
    const currentBig = BigInt(currentPrice || '100');
    if (conditionKind === 'price_at_or_above') {
      // 10% above current price
      const target = (currentBig * 110n) / 100n;
      setThreshold(target.toString());
    } else if (conditionKind === 'price_at_or_below') {
      // 10% below current price
      const target = (currentBig * 90n) / 100n;
      setThreshold(target.toString());
    } else if (conditionKind === 'day_change_at_or_above') {
      setThreshold('500'); // +5%
    } else if (conditionKind === 'day_change_at_or_below') {
      setThreshold('-500'); // -5%
    }
  }, [conditionKind, currentPrice]);

  // Close dialog on successful creation
  useEffect(() => {
    if (createState.status === 'ok') {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [createState.status]);

  const isPriceCondition = conditionKind.startsWith('price_');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <BellPlus className="size-4 text-amber-500" />
          {isEn ? 'Set alert' : '조건부 알림 설정'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-amber-500" />
            <DialogTitle>
              {isEn ? `Set alert for ${symbol}` : `${symbol} · ${name} 조건부 알림`}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isEn
              ? `Current price: ${groupDigits(currentPrice)} WLD. Server market ticker continuously monitors this stock.`
              : `현재가: ${groupDigits(currentPrice)} WLD. 서버 시장 티커가 실시간으로 조건을 감시합니다.`}
          </DialogDescription>
        </DialogHeader>

        <form action={createAction} className="grid gap-4 py-2">
          <input type="hidden" name="stockId" value={stockId} />

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              {isEn ? 'Condition kind' : '감시 조건'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConditionKind('price_at_or_above')}
                className={`flex items-center justify-center gap-1.5 rounded-md border p-2.5 text-xs font-medium transition-all ${
                  conditionKind === 'price_at_or_above'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-border/60 hover:bg-muted/50'
                }`}
              >
                <TrendingUp className="size-3.5" />
                {isEn ? 'Price ≥ Target' : '목표가 이상 (상승)'}
              </button>
              <button
                type="button"
                onClick={() => setConditionKind('price_at_or_below')}
                className={`flex items-center justify-center gap-1.5 rounded-md border p-2.5 text-xs font-medium transition-all ${
                  conditionKind === 'price_at_or_below'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                    : 'border-border/60 hover:bg-muted/50'
                }`}
              >
                <TrendingDown className="size-3.5" />
                {isEn ? 'Price ≤ Target' : '목표가 이하 (하락)'}
              </button>
              <button
                type="button"
                onClick={() => setConditionKind('day_change_at_or_above')}
                className={`flex items-center justify-center gap-1.5 rounded-md border p-2.5 text-xs font-medium transition-all ${
                  conditionKind === 'day_change_at_or_above'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-border/60 hover:bg-muted/50'
                }`}
              >
                <TrendingUp className="size-3.5" />
                {isEn ? 'Day change ≥' : '일일 급등 (bp)'}
              </button>
              <button
                type="button"
                onClick={() => setConditionKind('day_change_at_or_below')}
                className={`flex items-center justify-center gap-1.5 rounded-md border p-2.5 text-xs font-medium transition-all ${
                  conditionKind === 'day_change_at_or_below'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                    : 'border-border/60 hover:bg-muted/50'
                }`}
              >
                <TrendingDown className="size-3.5" />
                {isEn ? 'Day change ≤' : '일일 급락 (bp)'}
              </button>
            </div>
            <input type="hidden" name="conditionKind" value={conditionKind} />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              {isPriceCondition
                ? isEn
                  ? 'Target price (WLD)'
                  : '목표 가격 (WLD)'
                : isEn
                  ? 'Change threshold (basis points, 100 bp = 1%)'
                  : '변동률 기준 (basis points, 100 bp = 1%)'}
            </label>
            <div className="relative">
              <input
                name="threshold"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
                inputMode="numeric"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={isPriceCondition ? '예: 1500' : '예: 500 (+5%) 또는 -500 (-5%)'}
              />
              {isPriceCondition && (
                <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">
                  WLD
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isPriceCondition
                ? isEn
                  ? `Current: ${groupDigits(currentPrice)} WLD`
                  : `현재 가격: ${groupDigits(currentPrice)} WLD`
                : isEn
                  ? 'Examples: 500 = +5.00%, -300 = -3.00%'
                  : '예시: 500 = +5.00%, -300 = -3.00%'}
            </p>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              {isEn ? 'Cooldown (minutes)' : '재알림 대기 시간 (분)'}
            </label>
            <input
              name="cooldownMinutes"
              type="number"
              min="5"
              max="10080"
              defaultValue="60"
              required
              className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground">
              {isEn
                ? 'Minimum 5 minutes. Repeated triggers are protected during cooldown.'
                : '최소 5분. 동일 조건의 과도한 반복 발송을 방지합니다.'}
            </p>
          </div>

          <div className="mt-2 grid gap-2">
            <SubmitButton className="w-full">
              {isEn ? 'Save alert' : '알림 등록하기'}
            </SubmitButton>
            <ActionAlert state={createState} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
