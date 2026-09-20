'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { useQuote } from '@/lib/use-market-prices';
import { placeOrder } from './actions';

/**
 * One order form.
 */
export function TradeForm({
  stockId,
  side,
  currentPrice,
  dayOpenPrice,
  available,
  idSuffix = '',
}: {
  readonly stockId: string;
  readonly side: 'buy' | 'sell';
  readonly currentPrice: string;
  readonly dayOpenPrice?: string;
  /** Shares nobody is holding. A buy cannot exceed it; the database agrees. */
  readonly available?: string;
  readonly idSuffix?: string;
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  const [state, action] = useActionState(placeOrder, IDLE);
  const quote = useQuote(stockId, { price: currentPrice, open: dayOpenPrice ?? currentPrice });
  const label = side === 'buy' ? (isEn ? 'Buy' : '매수') : (isEn ? 'Sell' : '매도');
  const fieldId = `quantity-${side}-${stockId}${idSuffix}`;
  const [quantity, setQuantity] = useState('1');

  const addQty = (amount: number) => {
    const current = parseInt(quantity, 10) || 0;
    const next = Math.max(1, current + amount);
    setQuantity(String(next));
  };

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="stockId" value={stockId} />
      <input type="hidden" name="side" value={side} />

      <Field>
        <FieldLabel htmlFor={fieldId}>
          {isEn ? `${label} Quantity` : `${label}할 수량`}
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id={fieldId}
            name="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <InputGroupAddon align="inline-end">{isEn ? 'shares' : '주'}</InputGroupAddon>
        </InputGroup>

        <div className="flex flex-wrap gap-1.5 pt-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setQuantity('1')}
          >
            1{isEn ? 'sh' : '주'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => addQty(5)}
          >
            +5
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => addQty(10)}
          >
            +10
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => addQty(50)}
          >
            +50
          </Button>
          {side === 'buy' && available && Number(available) > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 text-xs px-2 font-semibold"
              onClick={() => setQuantity(available)}
            >
              MAX ({groupDigits(available)})
            </Button>
          )}
        </div>
      </Field>

      <p className="tabular text-xs text-muted-foreground">
        {isEn ? 'Indicative Price' : '현재 표시가'} {groupDigits(quote.price)} WLD
        {side === 'buy' && available !== undefined && (
          <> · {isEn ? `Available ${groupDigits(available)} shares` : `거래 가능 ${groupDigits(available)}주`}</>
        )}
      </p>

      <ActionAlert state={state} />
      <SubmitButton variant={side === 'buy' ? 'default' : 'outline'} className="min-h-11 font-bold">
        {isEn ? `Confirm ${label}` : `${label} 확정`}
      </SubmitButton>
    </form>
  );
}
