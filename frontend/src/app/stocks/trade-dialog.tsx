'use client';

import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TradeForm } from './trade-form';

/**
 * Buy or sell, with the quantity asked for in a dialog.
 */
export function TradeDialog({
  stockId,
  symbol,
  name,
  currentPrice,
  available,
  holdingQuantity,
  side,
  triggerLabel,
  triggerVariant,
  triggerClassName,
}: {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly available?: string;
  readonly holdingQuantity?: string;
  readonly side: 'buy' | 'sell';
  readonly triggerLabel?: React.ReactNode;
  readonly triggerVariant?: 'default' | 'outline' | 'secondary' | 'destructive';
  readonly triggerClassName?: string;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  const defaultLabel = side === 'buy' ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도');
  const defaultVariant = side === 'buy' ? 'default' : 'outline';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant ?? defaultVariant}
          className={triggerClassName ?? 'min-h-11'}
        >
          {triggerLabel ?? defaultLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {symbol} · {name} {defaultLabel}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? 'Execution price is re-evaluated by the server at the moment of order.'
              : '체결가는 주문 시점에 서버가 다시 읽습니다.'}
          </DialogDescription>
        </DialogHeader>
        <TradeForm
          stockId={stockId}
          side={side}
          currentPrice={currentPrice}
          {...(available === undefined ? {} : { available })}
          {...(holdingQuantity === undefined ? {} : { holdingQuantity })}
        />
      </DialogContent>
    </Dialog>
  );
}
