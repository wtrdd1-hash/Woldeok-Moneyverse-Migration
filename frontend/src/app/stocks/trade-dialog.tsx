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
  side,
}: {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly available?: string;
  readonly side: 'buy' | 'sell';
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  const label = side === 'buy' ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={side === 'buy' ? 'default' : 'outline'} className="min-h-11">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {symbol} · {name} {label}
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
        />
      </DialogContent>
    </Dialog>
  );
}
