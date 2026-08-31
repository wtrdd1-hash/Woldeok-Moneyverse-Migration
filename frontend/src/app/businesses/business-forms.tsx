'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { IDLE } from '@/lib/action-state';
import { purchaseBusiness, settleBusiness } from './actions';

/**
 * `lockedReason` is required and not optional, so a caller that has the ladder
 * cannot forget to pass it and quietly get an enabled button. It carries the
 * sentence rather than a boolean because a disabled control with no reason
 * beside it is the same dead end as the refusal it replaces.
 */
export function PurchaseButton({
  businessTypeId,
  lockedReason,
}: {
  readonly businessTypeId: string;
  readonly lockedReason: string | null;
}) {
  const [state, action] = useActionState(purchaseBusiness, IDLE);
  const locked = lockedReason !== null;
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="businessTypeId" value={businessTypeId} />
        <SubmitButton disabled={locked}>{locked ? '아직 살 수 없어요' : '사업권 구입'}</SubmitButton>
      </form>
      {locked ? (
        <p className="text-sm text-muted-foreground">{lockedReason}</p>
      ) : (
        <ActionAlert state={state} />
      )}
    </div>
  );
}

export function SettleButton({ ownershipId }: { readonly ownershipId: string }) {
  const [state, action] = useActionState(settleBusiness, IDLE);
  return (
    <div className="grid gap-2">
      <form action={action}>
        <input type="hidden" name="ownershipId" value={ownershipId} />
        <SubmitButton variant="outline">오늘 정산하기</SubmitButton>
      </form>
      <ActionAlert state={state} />
    </div>
  );
}
