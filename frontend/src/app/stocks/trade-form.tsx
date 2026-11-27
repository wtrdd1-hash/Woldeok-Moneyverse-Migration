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
import { FiatBadge } from '@/components/fiat-amount';
import { placeOrder } from './actions';
import { pick } from '@/lib/copy';
import { fill } from '@/lib/copy-format';
import { COPY } from './copy';

/**
 * One order form.
 */
export function TradeForm({
  stockId,
  side,
  currentPrice,
  dayOpenPrice,
  available,
  holdingQuantity,
  idSuffix = '',
}: {
  readonly stockId: string;
  readonly side: 'buy' | 'sell';
  readonly currentPrice: string;
  readonly dayOpenPrice?: string;
  /** Shares nobody is holding. A buy cannot exceed it; the database agrees. */
  readonly available?: string;
  readonly holdingQuantity?: string;
  readonly idSuffix?: string;
}) {
  const { locale } = useLocale();
  const [state, action] = useActionState(placeOrder, IDLE);
  const quote = useQuote(stockId, { price: currentPrice, open: dayOpenPrice ?? currentPrice });
  const label = pick(locale, side === 'buy' ? COPY.buy : COPY.sell);
  const fieldId = `quantity-${side}-${stockId}${idSuffix}`;
  const [quantity, setQuantity] = useState('1');

  const maxLimit = side === 'buy'
    ? (available ? Number.parseInt(available.replaceAll(',', ''), 10) || 0 : 0)
    : (holdingQuantity ? Number.parseInt(holdingQuantity.replaceAll(',', ''), 10) || 0 : 0);

  const addQty = (amount: number) => {
    const current = Number.parseInt(quantity, 10) || 0;
    const next = Math.max(1, current + amount);
    setQuantity(String(next));
  };

  const applyPercent = (pct: number) => {
    if (maxLimit <= 0) return;
    const computed = Math.max(1, Math.floor((maxLimit * pct) / 100));
    setQuantity(String(computed));
  };

  const priceNum = Number.parseInt(quote.price.replaceAll(',', '') || '0', 10);
  const qtyNum = Number.parseInt(quantity || '0', 10);
  const estimatedGross = priceNum * qtyNum;
  const estimatedTax = side === 'sell' ? Math.round(estimatedGross * 0.003) : 0;
  const estimatedNet = side === 'sell' ? Math.max(0, estimatedGross - estimatedTax) : estimatedGross;

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="stockId" value={stockId} />
      <input type="hidden" name="side" value={side} />

      <Field className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor={fieldId} className="text-xs font-semibold">
            {pick(locale, fill(COPY.quantityLabel, { side: label }))}
          </FieldLabel>
          <span className="text-xs font-mono text-muted-foreground">
            {side === 'buy' && available !== undefined
              ? pick(locale, fill(COPY.marketAvailable, { count: groupDigits(available) }))
              : side === 'sell' && holdingQuantity !== undefined
              ? pick(locale, fill(COPY.held, { count: groupDigits(holdingQuantity) }))
              : null}
          </span>
        </div>

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
            className="font-mono text-base font-bold min-h-11"
          />
          <InputGroupAddon align="inline-end" className="text-xs font-semibold">{pick(locale, COPY.sharesUnit)}</InputGroupAddon>
        </InputGroup>

        {/* Quantity preset chips, each at least a 44px touch target. */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 px-3 text-xs font-mono font-medium rounded-lg active:scale-95"
            onClick={() => setQuantity('1')}
          >
            {pick(locale, COPY.oneShare)}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 px-3 text-xs font-mono font-medium rounded-lg active:scale-95"
            onClick={() => addQty(5)}
          >
            +5
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 px-3 text-xs font-mono font-medium rounded-lg active:scale-95"
            onClick={() => addQty(10)}
          >
            +10
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 px-3 text-xs font-mono font-medium rounded-lg active:scale-95"
            onClick={() => addQty(50)}
          >
            +50
          </Button>

          {/* Percentage chips (10%, 25%, 50%, MAX). */}
          {maxLimit > 0 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-10 px-3 text-xs font-mono tabular-nums font-semibold rounded-lg active:scale-95"
                onClick={() => applyPercent(10)}
              >
                10%
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-10 px-3 text-xs font-mono font-semibold rounded-lg active:scale-95"
                onClick={() => applyPercent(25)}
              >
                25%
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-10 px-3 text-xs font-mono font-semibold rounded-lg active:scale-95"
                onClick={() => applyPercent(50)}
              >
                50%
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-10 px-3.5 text-xs font-mono font-bold rounded-lg active:scale-95 text-primary"
                onClick={() => setQuantity(String(maxLimit))}
              >
                MAX ({groupDigits(String(maxLimit))})
              </Button>
            </>
          )}
        </div>
      </Field>

      {/* Live estimate of the payment or settlement. */}
      <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5 space-y-2 text-xs font-mono tabular-nums">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{pick(locale, COPY.unitPrice)}</span>
          <span className="font-bold text-foreground">{groupDigits(quote.price)} WLD</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{pick(locale, COPY.grossTotal)}</span>
          <span>{groupDigits(estimatedGross.toString())} WLD</span>
        </div>
        {side === 'sell' && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{pick(locale, COPY.estTax)}</span>
            <span className="text-rose-500">-{groupDigits(estimatedTax.toString())} WLD</span>
          </div>
        )}
        <div className="border-t border-border/50 pt-2 flex items-center justify-between font-bold text-sm flex-wrap gap-2">
          <span className="text-foreground">{pick(locale, side === 'buy' ? COPY.estPayment : COPY.estRefund)}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={side === 'buy' ? 'text-primary text-base' : 'text-emerald-600 dark:text-emerald-400 text-base'}>
              {groupDigits(estimatedNet.toString())} WLD
            </span>
            <FiatBadge amount={estimatedNet.toString()} />
          </div>
        </div>
      </div>

      <ActionAlert state={state} />
      <SubmitButton
        variant={side === 'buy' ? 'trading-buy' : 'trading-sell'}
        className="min-h-11 font-bold text-sm shadow-sm"
      >
        {pick(locale, fill(COPY.confirmOrder, { side: label }))}
      </SubmitButton>
    </form>
  );
}
