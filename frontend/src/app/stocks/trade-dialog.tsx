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
import { pick } from '@/lib/copy';
import { fill } from '@/lib/copy-format';
import { COPY } from './copy';

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
  readonly triggerVariant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'destructive'
    | 'trading-buy'
    | 'trading-sell';
  readonly triggerClassName?: string;
}) {
  const { locale } = useLocale();
  const defaultLabel = pick(locale, side === 'buy' ? COPY.buy : COPY.sell);
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
            {pick(locale, fill(COPY.dialogTitle, { symbol, name, side: defaultLabel }))}
          </DialogTitle>
          <DialogDescription>
            {pick(locale, COPY.dialogNote)}
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
