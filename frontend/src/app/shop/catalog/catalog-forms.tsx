'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { buyCatalogItem, consumeHeldItem, settleItemUpkeep } from './actions';

/**
 * The catalogue's write surface.
 *
 * Both controls are a `<form action={serverAction}>`, so they work before
 * hydration and carry no CSRF token into the browser -- the action fetches
 * one on the server and spends it in the same call. `SubmitButton` disables
 * itself while a request is in flight, which is what stops a double click
 * buying twice; the idempotency key the action mints per submission is the
 * second line of defence, not the first.
 */

/**
 * Buy one line of the catalogue.
 *
 * The count field appears only when more than one may be asked for. An item
 * capped at a single hold gets a plain button, because a box that can only
 * ever hold 1 is a control that asks a question with one answer.
 *
 * `max` is a bound on this submission and not a promise about the member's
 * remaining allowance -- how much of a daily cap is already spent is not
 * readable -- so the database still has the last word and the action says so
 * when it refuses.
 */
export function BuyForm({
  catalogId,
  max,
}: {
  readonly catalogId: string;
  readonly max: number;
}) {
  const [state, action] = useActionState(buyCatalogItem, IDLE);

  return (
    <div className="grid w-full gap-2">
      <form action={action} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="catalogId" value={catalogId} />
        {max > 1 && (
          <InputGroup className="w-28">
            <InputGroupInput
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={max}
              step={1}
              defaultValue={1}
              aria-label="구매 수량"
            />
            <InputGroupAddon align="inline-end">개</InputGroupAddon>
          </InputGroup>
        )}
        <SubmitButton>구입하기</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

/** Spend one of an item the member holds. */
export function UseItemButton({ catalogId }: { readonly catalogId: string }) {
  const [state, action] = useActionState(consumeHeldItem, IDLE);

  return (
    <div className="grid w-full gap-2">
      <form action={action}>
        <input type="hidden" name="catalogId" value={catalogId} />
        <SubmitButton variant="outline">1개 사용하기</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}

/**
 * Pay off what a holding owes, so a suspended one works again.
 *
 * The amount is on the button and not in the request. `shop_settle_upkeep`
 * reads the capped figure inside the transaction that posts it, so the label
 * is a quotation of what the last read said and the charge is whatever the
 * database finds when it is asked -- which is the only ordering that cannot
 * charge a member for a week they have since paid.
 */
export function SettleUpkeepButton({
  catalogId,
  amount,
}: {
  readonly catalogId: string;
  readonly amount: string;
}) {
  const [state, action] = useActionState(settleItemUpkeep, IDLE);

  return (
    <div className="grid w-full gap-2">
      <form action={action}>
        <input type="hidden" name="catalogId" value={catalogId} />
        <SubmitButton>밀린 관리비 {groupDigits(amount)} WLD 내기</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
