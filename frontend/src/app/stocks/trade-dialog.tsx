'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
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
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { placeOrder } from './actions';

/**
 * Buy or sell, with the quantity asked for in a dialog.
 *
 * The original used `window.prompt`, which cannot be styled, cannot be
 * cancelled by keyboard predictably, and gives a screen reader nothing to
 * announce. This asks the same question in a focus-trapped dialog and says
 * the price the page is showing — while making clear the server re-reads it.
 */
export function TradeDialog({
  stockId,
  symbol,
  name,
  currentPrice,
  side,
}: {
  readonly stockId: string;
  readonly symbol: string;
  readonly name: string;
  readonly currentPrice: string;
  readonly side: 'buy' | 'sell';
}) {
  const [state, action] = useActionState(placeOrder, IDLE);
  const label = side === 'buy' ? '매수' : '매도';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={side === 'buy' ? 'default' : 'outline'} className="min-h-11">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <input type="hidden" name="stockId" value={stockId} />
          <input type="hidden" name="side" value={side} />
          <DialogHeader>
            <DialogTitle>
              {symbol} · {name} {label}
            </DialogTitle>
            <DialogDescription>
              현재 표시가는 {groupDigits(currentPrice)} WLD 입니다. 체결가는 주문 시점에 서버가
              다시 읽습니다.
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor={`quantity-${side}-${stockId}`}>{label}할 수량</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id={`quantity-${side}-${stockId}`}
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

          <ActionAlert state={state} />

          <DialogFooter>
            <SubmitButton>{label} 확정</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
