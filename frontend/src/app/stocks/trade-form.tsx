'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { useQuote } from '@/lib/use-market-prices';
import { placeOrder } from './actions';

/**
 * One order.
 *
 * Shared by the buttons on a market card and by the detail dialog, so a reader
 * who opened the chart to decide can act on the decision without closing it —
 * which was the whole point of asking for the chart beside the buttons.
 *
 * The price shown is the live one. It is still labelled as a display price,
 * because the server re-reads it when the order lands: between the reader
 * seeing a number and the database applying one, the market has ticked.
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
  const [state, action] = useActionState(placeOrder, IDLE);
  const quote = useQuote(stockId, { price: currentPrice, open: dayOpenPrice ?? currentPrice });
  const label = side === 'buy' ? '매수' : '매도';
  const fieldId = `quantity-${side}-${stockId}${idSuffix}`;

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="stockId" value={stockId} />
      <input type="hidden" name="side" value={side} />

      <Field>
        <FieldLabel htmlFor={fieldId}>{label}할 수량</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id={fieldId}
            name="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            defaultValue={1}
            required
          />
          <InputGroupAddon align="inline-end">주</InputGroupAddon>
        </InputGroup>
      </Field>

      <p className="tabular text-xs text-muted-foreground">
        현재 표시가 {groupDigits(quote.price)} WLD
        {side === 'buy' && available !== undefined && (
          <> · 거래 가능 {groupDigits(available)}주</>
        )}
      </p>

      <ActionAlert state={state} />
      <SubmitButton variant={side === 'buy' ? 'default' : 'outline'}>{label} 확정</SubmitButton>
    </form>
  );
}
